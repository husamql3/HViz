import type { DatabaseType } from "@/types/db.type";
import type { ErdResult } from "@/types/erd.type";
import { genDrizzleERD } from "@/utils/erd/gen-drizzle-erd";
import { genPrismaERD } from "@/utils/erd/gen-prisma-erd";

export const generateERD = async (schema: string, type: DatabaseType): Promise<ErdResult> => {
	switch (type) {
		case "prisma":
			return genPrismaERD(schema);
		case "drizzle-postgres":
		case "drizzle-mysql":
		case "drizzle-sqlite":
			return genDrizzleERD(schema, type);
		default:
			throw new Error(`Unsupported database type: ${type}`);
	}
};
