import { resolve } from "node:path";
import { cancel, intro, isCancel, outro, select, spinner, text } from "@clack/prompts";
import { createServer, PORT } from "@viz/server";
import { file, serve, write } from "bun";
import open from "open";
import color from "picocolors";

import type { ErdResult } from "@/types/erd.type";
import { generateErd } from "@/utils/generate-erd";
import { schemaPathSuggestions } from "@/utils/schema-path-suggestions";

export const main = async () => {
	console.log();
	intro(color.inverse(" Viz "));

	const projectType = await select({
		message: "Pick your ORM/Database.",
		options: [
			{ value: "prisma", label: "Prisma" },
			{ value: "drizzle", label: "Drizzle", hint: "coming soon" },
			{ value: "typeorm", label: "TypeORM", hint: "coming soon" },
			{ value: "postgres", label: "Postgres", hint: "coming soon" },
			{ value: "mysql", label: "MySQL", hint: "coming soon" },
			{ value: "sqlite", label: "SQLite", hint: "coming soon" },
		],
	});
	if (isCancel(projectType)) {
		cancel("Operation cancelled");
		return process.exit(0);
	}

	const { schemaPromptMessage, defaultSchemaPath } = schemaPathSuggestions(projectType);
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

	const schemaFilePath = resolve(import.meta.dir, schemaFilePathInput);

	try {
		(await file(schemaFilePath).exists()) ||
			(() => {
				throw new Error("Schema file not found");
			})();
	} catch {
		cancel(`Schema file does not exist at ${schemaFilePath}`);
		process.exit(1);
	}

	const s1 = spinner();
	s1.start("Loading schema");
	const schema = await file(schemaFilePath).text();
	s1.stop("Schema loaded");

	const s2 = spinner();
	s2.start("Generating ERD");
	let erdResult: ErdResult | undefined;
	try {
		erdResult = await generateErd(schema, projectType);
	} catch (e) {
		s2.stop("ERD generation failed");
		cancel(`Error generating ERD: ${e instanceof Error ? e.message : "Unknown error"}`);
		return process.exit(1);
	}
	s2.stop("ERD generated");

	const outputPath = `${import.meta.dir}/../../view/src/utils/data.json`;

	const s3 = spinner();
	s3.start("Writing output");
	try {
		await write(outputPath, JSON.stringify(erdResult, null, 2));
		s3.stop("Output written");
	} catch (e) {
		s3.stop("Failed to write output");
		cancel(`Error writing output: ${e instanceof Error ? e.message : "Unknown error"}`);
		process.exit(1);
	}

	const s4 = spinner();
	s4.start("Starting server");

	const app = createServer(erdResult);
	serve({
		fetch: app.fetch,
		port: PORT,
	});

	s4.stop("Server started");
	outro(color.green(`Server running at ${color.cyan(`http://localhost:${PORT}`)}`));

	try {
		await open(`http://localhost:${PORT}`);
	} catch (_e) {
		console.warn(
			color.yellow(`⚠️  Failed to open browser. Please visit ${color.cyan(`http://localhost:${PORT}`)} manually.`),
		);
	}
};

main().catch((err) => {
	console.error(color.red(`❌ Unexpected error: ${err.message}`));
	process.exit(1);
});
