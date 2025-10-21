import { serve } from "@hono/node-server";
import { cancel, intro, isCancel, outro, spinner, text } from "@clack/prompts";
import { resolve } from "node:path";
import { access, readFile } from "node:fs/promises";
import open from "open";
import color from "picocolors";

import { selectDB } from "./cmd/select-db";
import { cmdArgs } from "./cmd/cmd-args";
import { schemaPathSuggestions } from "./cmd/schema-path-suggestions";
import type { ErdResult } from "./types/erd.type";
import { genDrizzleERD } from "./generators/gen-drizzle-erd";
import { genPrismaERD } from "./generators/gen-prisma-erd";
import { createServer } from "./lib/create-server";
import { genTypeORMERD } from "./generators/gen-typeorm-erd";

export const main = async () => {
  const { port } = cmdArgs();

  console.log();
  intro(color.inverse(" HViz "));

  // Select the database type (prisma, drizzle, typeorm)
  const databaseType = await selectDB();

  // Get the schema path suggestions based on the database type
  const { schemaPromptMessage, defaultSchemaPath } = schemaPathSuggestions(databaseType);

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

  const schemaFilePath = resolve(process.cwd(), schemaFilePathInput);
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
      const schemaModule = await import(schemaFilePath);
      erdResult = await genDrizzleERD(schemaModule, databaseType);
    } else if (databaseType === "prisma") {
      erdResult = await genPrismaERD(schemaFilePath);
    } else if (databaseType === "typeorm") {
      erdResult = await genTypeORMERD(schemaFilePath);
    }
  } catch (e) {
    s2.stop("ERD generation failed");
    cancel(`Error generating ERD: ${e instanceof Error ? e.message : "Unknown error"}`);
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
  } catch (e) {
    console.warn(
      color.yellow(`⚠️  Failed to open browser. Please visit ${color.cyan(`http://localhost:${port}`)} manually.`),
    );
  }
}

main().catch((err) => {
  console.error(color.red(`❌ Unexpected error: ${err.message}`));
  process.exit(1);
});
