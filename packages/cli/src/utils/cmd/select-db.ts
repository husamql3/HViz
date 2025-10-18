import { cancel, isCancel, select } from "@clack/prompts";
import type { DatabaseType } from "@/types/db.type";

export const selectDB = async (): Promise<DatabaseType> => {
	const orm = await select({
		message: "Pick your ORM/Database.",
		options: [
			{ value: "prisma", label: "Prisma" },
			{ value: "drizzle", label: "Drizzle" },
			{ value: "typeorm", label: "TypeORM", hint: "coming soon" },
			{ value: "postgres", label: "PostgreSQL", hint: "coming soon" },
			{ value: "mysql", label: "MySQL", hint: "coming soon" },
			{ value: "sqlite", label: "SQLite", hint: "coming soon" },
		],
	});
	if (isCancel(orm)) {
		cancel("Operation cancelled");
		return process.exit(0);
	}

	if (["typeorm", "postgres", "mysql", "sqlite"].includes(orm)) {
		cancel(`${orm} is not supported yet. Please use Drizzle or Prisma.`);
		return process.exit(0);
	}

	let finalOrm: DatabaseType = orm;

	if (orm === "drizzle") {
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
		finalOrm = drizzleDialect;
	}

	return finalOrm;
};
