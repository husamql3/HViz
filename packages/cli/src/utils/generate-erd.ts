import { file } from "bun";
import type { DatabaseType } from "@/types/db.type";
import type { ErdResult } from "@/types/erd.type";
import { genDrizzleERD } from "@/utils/erd/gen-drizzle-erd";
import { genPrismaERD } from "@/utils/erd/gen-prisma-erd";

type GenerateERDOptions = {
	type: DatabaseType;
	schemaFilePath: string;
};

export const generateERD = async ({ type, schemaFilePath }: GenerateERDOptions): Promise<ErdResult> => {
	switch (type) {
		/**
		 * prisma erd generator should accept the schema string
		 */
		case "prisma": {
			const schema = await file(schemaFilePath).text();
			return genPrismaERD(schema);
		}
		/**
		 * drizzle erd generator should accept the schema module and the database type
		 */
		case "drizzle-postgres":
		case "drizzle-mysql":
		case "drizzle-sqlite": {
			const schemaModule = await import(schemaFilePath);
			return genDrizzleERD(schemaModule, type);
		}
		default:
			throw new Error(`Unsupported database type: ${type}`);
	}
};
