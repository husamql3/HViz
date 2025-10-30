import { cancel, isCancel, select } from "@clack/prompts";

import type { DatabaseType } from "../types/db.type";

export const selectDB = async (): Promise<DatabaseType> => {
	const databaseType = await select({
		message: "Pick your ORM/Database.",
		options: [
			{ value: "prisma", label: "Prisma" },
			{ value: "drizzle", label: "Drizzle" },
			{ value: "typeorm", label: "TypeORM" },
			{ value: "postgres", label: "PostgreSQL" },
			{ value: "mysql", label: "MySQL" },
			{ value: "sqlite", label: "SQLite" },
		],
	});
	if (isCancel(databaseType)) {
		cancel("Operation cancelled");
		return process.exit(0);
	}

	let finalDatabaseType: DatabaseType = databaseType as DatabaseType;

	if (databaseType === "drizzle") {
		const drizzleDialect = await select({
			message: "Pick your database dialect.",
			options: [
				{ value: "drizzle-postgres", label: "PostgreSQL" },
				{ value: "drizzle-mysql", label: "MySQL" },
				{ value: "drizzle-sqlite", label: "SQLite" },
			],
		});
		if (isCancel(drizzleDialect)) {
			cancel("Operation cancelled");
			return process.exit(0);
		}
		finalDatabaseType = drizzleDialect as DatabaseType;
	}

	return finalDatabaseType;
};
