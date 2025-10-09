import {
  intro,
  outro,
  select,
  spinner,
  isCancel,
  cancel,
  text,
} from "@clack/prompts";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import color from "picocolors";
import open from "open";
import path from "node:path";
import { generateErd } from "./generate-erd";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { createServer, PORT } from "./create-server";

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
  if (!existsSync(schemaFilePath)) {
    cancel("Schema file does not exist");
    return process.exit(0);
  }

  const s1 = spinner();
  s1.start("getting schema");
  // read the schema file
  const schema = readFileSync(schemaFilePath, "utf8");
  s1.stop("got schema");

  const s2 = spinner();
  s2.start("generating ERD");
  const reactFlowData = await generateErd(schema);
  s2.stop("ERD generated");

  // const s3 = spinner();
  // s3.start("writing data");
  // writeFileSync(
  //   path.join(__dirname, '../../view/src', 'data.json'),
  //   JSON.stringify(reactFlowData, null, 2)
  // );
  // s3.stop("data written");

  const s4 = spinner();
  s4.start("starting server");

  const app = createServer(reactFlowData)
  serve({
    fetch: app.fetch,
    port: PORT,
  })

  s4.stop("server started");
  outro(color.green(`Server running at http://localhost:${PORT}`));

  // Open browser
  await open(`http://localhost:${PORT}`);
};

main().catch(console.error);