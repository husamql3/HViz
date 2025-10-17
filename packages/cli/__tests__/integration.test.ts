// Mock drizzle generator
import { describe, expect, it, vi } from "vitest";
import { mediumDrizzleDbml } from "../__mocks__/drizzle-schemas";
import { complexPrismaSchema, mediumPrismaSchema } from "../__mocks__/prisma-schemas";
import { genDrizzleERD } from "../src/utils/erd/gen-drizzle-erd";
import { genPrismaERD } from "../src/utils/erd/gen-prisma-erd";

vi.mock("drizzle-dbml-generator", () => ({
	pgGenerate: vi.fn(() => mediumDrizzleDbml),
	mysqlGenerate: vi.fn(() => mediumDrizzleDbml),
	sqliteGenerate: vi.fn(() => mediumDrizzleDbml),
}));

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

	describe("Concurrent Processing", () => {
		it("should handle multiple ERD generations concurrently", async () => {
			const promises = [
				genPrismaERD(mediumPrismaSchema),
				genPrismaERD(complexPrismaSchema),
				genDrizzleERD("", "drizzle-postgres"),
				genDrizzleERD("", "drizzle-mysql"),
			];

			const results = await Promise.all(promises);

			expect(results).toHaveLength(4);
			results.forEach((result) => {
				expect(result.nodes.length).toBeGreaterThan(0);
			});
		});

		it("should maintain isolation between concurrent generations", async () => {
			const [result1, result2] = await Promise.all([
				genPrismaERD(mediumPrismaSchema),
				genPrismaERD(complexPrismaSchema),
			]);

			// Results should be different
			expect(result1.nodes.length).not.toBe(result2.nodes.length);
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
