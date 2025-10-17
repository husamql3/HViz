import { resolve } from "node:path";
import { cancel, intro, isCancel, outro, spinner, text } from "@clack/prompts";
import { createServer, PORT } from "@viz/server";
import { file, serve } from "bun";
import open from "open";
import color from "picocolors";

import type { ErdResult } from "@/types/erd.type";
import { schemaPathSuggestions } from "@/utils/cmd/schema-path-suggestions";
import { selectDB } from "./utils/cmd/select-db";
import { genDrizzleERD } from "./utils/erd/gen-drizzle-erd";
import { genPrismaERD } from "./utils/erd/gen-prisma-erd";

export const main = async () => {
	console.log();
	intro(color.inverse(" Viz "));

	// Select the database type (prisma, drizzle, typeorm)
	const projectType = await selectDB();

	// Get the schema path suggestions based on the database type
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

	const s2 = spinner();
	s2.start("Generating ERD");
	let erdResult: ErdResult | undefined;
	try {
		if (projectType.startsWith("drizzle")) {
			const schemaModule = await import(schemaFilePath);
			erdResult = await genDrizzleERD(schemaModule, projectType);
		} else {
			const schema = await file(schemaFilePath).text();
			erdResult = await genPrismaERD(schema);
		}
	} catch (e) {
		s2.stop("ERD generation failed");
		cancel(`Error generating ERD: ${e instanceof Error ? e.message : "Unknown error"}`);
		return process.exit(1);
	}
	s2.stop("ERD generated");

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
