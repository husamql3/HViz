// /* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { describe, expect, it, vi } from "vitest";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { mediumDrizzleDbml } from "../__mocks__/drizzle-schemas";
import { complexPrismaSchema, mediumPrismaSchema } from "../__mocks__/prisma-schemas";
import { genDrizzleERD } from "../src/generators/gen-drizzle-erd";
import { genPrismaERD } from "../src/generators/gen-prisma-erd";

// Mock drizzle-dbml-generator with inline return values
vi.mock("drizzle-dbml-generator", () => ({
	pgGenerate: vi.fn().mockReturnValue(mediumDrizzleDbml),
	mysqlGenerate: vi.fn().mockReturnValue(mediumDrizzleDbml),
	sqliteGenerate: vi.fn().mockReturnValue(mediumDrizzleDbml),
}));

// Helper function to create temporary TypeORM schema
async function createTempTypeORMSchema(schema: Record<string, string>): Promise<string> {
	const tempDir = join(tmpdir(), `typeorm-integration-${Date.now()}-${Math.random().toString(36).slice(2)}`);
	await mkdir(tempDir, { recursive: true });

	for (const [filename, content] of Object.entries(schema)) {
		await writeFile(join(tempDir, filename), content, "utf-8");
	}

	return tempDir;
}

describe("Integration Tests", () => {
	describe("End-to-End ERD Generation", () => {
		it("should generate consistent output format across ORMs", async () => {
			const prismaResult = await genPrismaERD(mediumPrismaSchema);
			const drizzleResult = await genDrizzleERD("", "drizzle-postgres");

			// Both should have the same structure
			expect(prismaResult).toHaveProperty("nodes");
			expect(prismaResult).toHaveProperty("edges");
			expect(drizzleResult).toHaveProperty("nodes");
			expect(drizzleResult).toHaveProperty("edges");

			// Nodes should have same shape
			prismaResult.nodes.forEach((node) => {
				expect(node).toHaveProperty("id");
				expect(node).toHaveProperty("type");
				expect(node).toHaveProperty("data");
				expect(node.data).toHaveProperty("label");
				expect(node.data).toHaveProperty("fields");
				expect(node).toHaveProperty("position");
				expect(node).toHaveProperty("style");
			});

			drizzleResult.nodes.forEach((node) => {
				expect(node).toHaveProperty("id");
				expect(node).toHaveProperty("type");
				expect(node).toHaveProperty("data");
				expect(node.data).toHaveProperty("label");
				expect(node.data).toHaveProperty("fields");
				expect(node).toHaveProperty("position");
				expect(node).toHaveProperty("style");
			});
		});

		it("should handle complex relationships correctly", async () => {
			const result = await genPrismaERD(complexPrismaSchema);

			// Verify relationship types
			const relationshipTypes = new Set(result.edges?.map((e) => e.data.relationshipType));

			expect(relationshipTypes.has("one-to-one")).toBe(true);
			expect(relationshipTypes.has("one-to-many")).toBe(true);
			expect(relationshipTypes.has("many-to-one")).toBe(true);
		});

		it("should maintain referential integrity", async () => {
			const result = await genPrismaERD(complexPrismaSchema);

			const nodeIds = new Set(result.nodes.map((n) => n.id));

			// All edge sources and targets should reference existing nodes
			result.edges?.forEach((edge) => {
				expect(nodeIds.has(edge.source)).toBe(true);
				expect(nodeIds.has(edge.target)).toBe(true);
			});

			// All object-type fields should reference existing tables
			result.nodes.forEach((node) => {
				node.data.fields.forEach((field) => {
					if (field.kind === "object") {
						expect(nodeIds.has(field.type)).toBe(true);
					}
				});
			});
		});

		it("should calculate reasonable table widths", async () => {
			const result = await genPrismaERD(complexPrismaSchema);

			result.nodes.forEach((node) => {
				expect(node.style.width).toBeGreaterThanOrEqual(280);
				expect(node.style.width).toBeLessThanOrEqual(600);
			});
		});
	});

	describe("Error Handling", () => {
		it("should handle invalid Prisma schema gracefully", async () => {
			const invalidSchema = "invalid schema syntax";

			await expect(genPrismaERD(invalidSchema)).rejects.toThrow();
		});

		it("should handle empty schema", async () => {
			const emptySchema = "";

			await expect(genPrismaERD(emptySchema)).rejects.toThrow();
		});
	});

	describe("Performance Under Load", () => {
		it("should handle multiple large schema generations", async () => {
			const { generateLargePrismaSchema } = await import("../__mocks__/prisma-schemas");

			const schemas = Array.from({ length: 10 }, () => generateLargePrismaSchema(20));

			const startTime = performance.now();
			const results = await Promise.all(schemas.map((s) => genPrismaERD(s)));
			const duration = performance.now() - startTime;

			expect(results).toHaveLength(10);
			expect(duration).toBeLessThan(15000); // 10 schemas with 20 tables each in under 15s
		}, 20000);
	});
});