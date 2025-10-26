import type { DatabaseType } from "../types/db.type.ts";

export const schemaPathSuggestions = (db: DatabaseType) => {
	let schemaPromptMessage = "";
	let defaultSchemaPath = "";

	switch (db) {
		case "prisma":
			schemaPromptMessage = "Enter the Prisma directory path or schema file path";
			defaultSchemaPath = "prisma/schema.prisma";
			break;
		case "drizzle-postgres":
		case "drizzle-mysql":
		case "drizzle-sqlite":
			schemaPromptMessage = "Enter the Drizzle directory path or schema file path";
			defaultSchemaPath = "drizzle/schema.ts";
			break;
		case "typeorm":
			schemaPromptMessage = "Enter the TypeORM entities directory or config path";
			defaultSchemaPath = "src/entities/";
			break;
		case "mysql":
			schemaPromptMessage = "Enter the MySQL schema directory path";
			defaultSchemaPath = "db/schema/";
			break;
	}

	return {
		schemaPromptMessage,
		defaultSchemaPath,
	};
};
