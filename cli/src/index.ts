import {
  intro,
  outro,
  confirm,
  select,
  spinner,
  isCancel,
  cancel,
  text,
} from "@clack/prompts";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
import color from "picocolors";
import path from "node:path";
import { generateErd } from "@/utils/generate-erd";

const outputPath = path.join(__dirname, '../../view/src', 'data.json');

async function main() {
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

  // enter the prisma schema file path
  const schemaFilePath = await text({
    // todo: allow auto completion in the cli
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

  const s = spinner();
  s.start("getting schema");

  // read the schema file
  const schema = readFileSync(schemaFilePath, "utf8");
  s.stop("got schema");

  const reactFlowData = await generateErd(schema);
  writeFileSync(outputPath, JSON.stringify(reactFlowData, null, 2));

  outro("You're all set!");

  await sleep(1000);
}

main().catch(console.error);