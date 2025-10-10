import {
  intro,
  outro,
  select,
  // spinner,
  isCancel,
  cancel,
  text,
} from "@clack/prompts";
import { access, readFile } from "node:fs/promises";
import color from "picocolors";
import open from "open";
import { serve } from "@hono/node-server";

import { generateErd } from "@/utils/generate-erd";
import { createServer, PORT } from "@/server/create-server";

export const main = async () => {
  console.log();
  intro(color.inverse(" Vizma "));

  const projectType = await select({
    message: "Pick your ORM.",
    options: [
      { value: "prisma", label: "Prisma" },
      { value: "drizzle", label: "Drizzle" },
      { value: "typeorm", label: "TypeORM", hint: "oh no" },
    ],
  });
  if (isCancel(projectType)) {
    cancel("Operation cancelled");
    return process.exit(0);
  }

  const schemaFilePath = await text({
    message: "Enter the Prisma schema file path",
    placeholder: "prisma/schema.prisma",
  });
  if (isCancel(schemaFilePath)) {
    cancel("Operation cancelled");
    return process.exit(0);
  }

  // check if the schema file exists
  if (!access(schemaFilePath)) {
    cancel("Schema file does not exist");
    return process.exit(0);
  }

  // const s1 = spinner();
  // s1.start("getting schema");
  const schema = await readFile(schemaFilePath, "utf8");
  // s1.stop("got schema");

  const reactFlowData = await generateErd(schema);

  const app = createServer(reactFlowData);
  serve({
    fetch: app.fetch,
    port: PORT,
  })

  outro(color.green(`Server running at http://localhost:${PORT}`));

  // Open browser
  await open(`http://localhost:${PORT}`);
}

main().catch(console.error);