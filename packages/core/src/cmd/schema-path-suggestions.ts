import type { DatabaseType } from "../types/db.type.ts";

export const schemaPathSuggestions = (db: DatabaseType) => {
	let schemaPromptMessage = "";
	let defaultSchemaPath = "";

	switch (db) {
		case "prisma":
			schemaPromptMessage = "Enter the Prisma schema file path";
			defaultSchemaPath = "prisma/schema.prisma";
			break;
		case "drizzle-postgres":
		case "drizzle-mysql":
		case "drizzle-sqlite":
			schemaPromptMessage = "Enter the Drizzle schema file path";
			defaultSchemaPath = "drizzle/schema.ts";
			break;
		case "typeorm":
			schemaPromptMessage = "Enter the TypeORM entities directory or config path";
			defaultSchemaPath = "src/entities";
			break;
	}

	return {
		schemaPromptMessage,
		defaultSchemaPath,
	};
};
