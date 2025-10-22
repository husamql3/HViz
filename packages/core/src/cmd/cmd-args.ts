import { cancel } from "@clack/prompts";
import { Command } from "commander";

import type { DatabaseType } from "../types/db.type";
import packageJson from "../../package.json" assert { type: "json" };

export const DEFAULT_PORT = 3333;

export const cmdArgs = (): {
	port: number;
	type?: DatabaseType;
	schema?: string;
} => {
	const program = new Command();
	program
		.name("hviz")
		.description("CLI tool for visualizing your database schema")
		.version(packageJson.version, "-v, --version", "Display version number")
		.option("-p, --port <number>", "Port to run the server on", DEFAULT_PORT.toString())
		.option(
			"-t, --type <type>",
			"Database type (prisma, drizzle-postgres, drizzle-mysql, drizzle-sqlite, typeorm, postgres, mysql, sqlite)",
		)
		.option("-s, --schema <schema>", "Path to schema file or directory")
		.parse(process.argv);

	const options = program.opts();
	const port = parseInt(options.port, 10);

	// Validate port
	if (Number.isNaN(port) || port < 1 || port > 65535) {
		cancel("Invalid port number. Please provide a port between 1 and 65535.");
		process.exit(1);
	}

	// Validate type if provided
	const validTypes = [
		"prisma",
		"drizzle-postgres",
		"drizzle-mysql",
		"drizzle-sqlite",
		"typeorm",
		"postgres",
		"mysql",
		"sqlite",
	];
	if (options.type && !validTypes.includes(options.type)) {
		cancel(`Invalid database type. Valid types are: ${validTypes.join(", ")}`);
		process.exit(1);
	}

	// Check if both type and path are provided together or neither
	if ((options.type && !options.schema) || (!options.type && options.schema)) {
		cancel("Both --type and --schema must be provided together.");
		process.exit(1);
	}

	return {
		port,
		type: options.type as DatabaseType | undefined,
		schema: options.schema,
	};
};
