import { access, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { cancel, intro, isCancel, outro, select, spinner, text } from "@clack/prompts";
import { createServer, PORT } from "@viz/server";
import { file, serve, write } from "bun";
import open from "open";
import color from "picocolors";
import { generateErd } from "./generate-erd";

export const main = async () => {
	console.log();
	intro(color.inverse(" Viz "));

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

	const s1 = spinner();
	s1.start("getting schema");
	// todo: use bun API to read the file
	const schema = await file(schemaFilePath).text();
	s1.stop("got schema");

	const s2 = spinner();
	s2.start("generating ERD");
	const reactFlowData = await generateErd(schema);

	// Use absolute path to ensure it works correctly
	const outputPath = join(import.meta.dir, "../../view/src/utils/data.json");
	const outputDir = dirname(outputPath);

	// Ensure the directory exists
	await mkdir(outputDir, { recursive: true });

	// Use Bun's file API to write
	await write(outputPath, JSON.stringify(reactFlowData, null, 2));

	s2.stop("ERD generated");

	const s4 = spinner();
	s4.start("starting server");

	const app = createServer(reactFlowData);
	serve({
		fetch: app.fetch,
		port: PORT,
	});

	s4.stop("server started");
	outro(color.green(`Server running at http://localhost:${PORT}`));

	// Open browser
	await open(`http://localhost:${PORT}`);
};

main().catch(console.error);
