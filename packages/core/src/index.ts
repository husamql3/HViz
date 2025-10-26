import { access, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { cancel, intro, isCancel, outro, spinner, text } from "@clack/prompts";
import { serve } from "@hono/node-server";
import open from "open";
import color from "picocolors";

import { cmdArgs } from "./cmd/cmd-args";
import { schemaPathSuggestions } from "./cmd/schema-path-suggestions";
import { selectDB } from "./cmd/select-db";
import { genDrizzleERD } from "./generators/gen-drizzle-erd";
import { genPrismaERD } from "./generators/gen-prisma-erd";
import { genTypeORMERD } from "./generators/gen-typeorm-erd";
import { genMySQLERD } from "./generators/gen-mysql-erd";
import { createServer } from "./lib/create-server";
import type { DatabaseType } from "./types/db.type";
import type { ErdResult } from "./types/erd.type";

export const main = async () => {
  const { port, type, schema } = cmdArgs();

  intro(color.inverse(" HViz "));

  let databaseType: DatabaseType;
  let schemaFilePath: string;

  // If type and schema are provided via CLI, skip interactive prompts
  if (type && schema) {
    databaseType = type as DatabaseType;
    schemaFilePath = resolve(process.cwd(), schema);
  } else {
    // Interactive mode: prompt for database type
    databaseType = await selectDB();

    // Get the schema path suggestions based on the database type
    const { schemaPromptMessage, defaultSchemaPath } = schemaPathSuggestions(databaseType as DatabaseType);

    const schemaFilePathInput = await text({
      message: schemaPromptMessage,
      placeholder: defaultSchemaPath,
      validate: (value) => {
        if (!value.trim()) return "Schema path is required.";
        return undefined;
      },
    });

    if (isCancel(schemaFilePathInput)) {
      cancel("Operation cancelled");
      return process.exit(0);
    }

    schemaFilePath = resolve(process.cwd(), schemaFilePathInput);
  }

  // Validate schema file exists
  try {
    await access(schemaFilePath);
  } catch {
    cancel(`Schema file does not exist at ${schemaFilePath}`);
    return process.exit(1);
  }

  const s2 = spinner();
  s2.start("Generating ERD");
  let erdResult: ErdResult | undefined;
  try {
    if (databaseType.startsWith("drizzle")) {
      const stats = await stat(schemaFilePath);
      if (stats.isFile()) {
        const schemaModule = await import(schemaFilePath);
        erdResult = await genDrizzleERD(schemaModule, databaseType as DatabaseType);
      } else if (stats.isDirectory()) {
        erdResult = await genDrizzleERD(schemaFilePath, databaseType as DatabaseType);
      }
    } else if (databaseType === "prisma") {
      erdResult = await genPrismaERD(schemaFilePath);
    } else if (databaseType === "typeorm") {
      erdResult = await genTypeORMERD(schemaFilePath);
    } else if (databaseType === "mysql") {
      erdResult = await genMySQLERD(schemaFilePath);
    }
  } catch (e) {
    s2.stop("ERD generation failed");
    console.log(e);
    cancel(`Error generating ERD: ${e instanceof Error ? e : "Unknown error"}`);
    return process.exit(1);
  }

  if (!erdResult) {
    s2.stop("ERD generation failed");
    cancel("ERD generation failed: No result produced");
    return process.exit(1);
  }
  s2.stop("ERD generated");

  if (process.env.NODE_ENV === "development") {
    const { writeFile } = await import("node:fs/promises");
    await writeFile(resolve(import.meta.dir, "../../view/app/utils/data.json"), JSON.stringify(erdResult, null, 2));
  }

  const s3 = spinner();
  s3.start("Starting server");
  const server = createServer(erdResult);
  serve({
    fetch: server.fetch,
    port: port,
  });
  s3.stop("Server started");
  outro(color.green(`Server running at ${color.cyan(`http://localhost:${port}`)}`));

  try {
    await open(`http://localhost:${port}`);
  } catch (_e) {
    console.warn(
      color.yellow(`⚠️  Failed to open browser. Please visit ${color.cyan(`http://localhost:${port}`)} manually.`),
    );
  }
};

main().catch((err) => {
  console.error(color.red(`❌ Unexpected error: ${err.message}`));
  process.exit(1);
});
