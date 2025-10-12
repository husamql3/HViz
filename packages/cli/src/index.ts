import { access, readFile } from "node:fs/promises";
import { cancel, intro, isCancel, outro, select, spinner, text } from "@clack/prompts";
import { createServer, PORT } from "@viz/server";
import { serve } from "bun";
import open from "open";
import color from "picocolors";
import { generateErd } from "./generate-erd";

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

	const s1 = spinner();
	s1.start("getting schema");
	// todo: use bun API to read the file
	const schema = await readFile(schemaFilePath, "utf8");
	s1.stop("got schema");

	const s2 = spinner();
	s2.start("generating ERD");
	const reactFlowData = await generateErd(schema);
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
