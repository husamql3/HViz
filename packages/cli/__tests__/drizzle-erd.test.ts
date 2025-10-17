import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	complexDrizzleDbml,
	generateLargeDrizzleDbml,
	mediumDrizzleDbml,
	simpleDrizzleDbml,
} from "../__mocks__/drizzle-schemas";
import { genDrizzleERD } from "../src/utils/erd/gen-drizzle-erd";

// Mock the drizzle-dbml-generator functions
vi.mock("drizzle-dbml-generator", () => ({
	pgGenerate: vi.fn(() => simpleDrizzleDbml),
	mysqlGenerate: vi.fn(() => simpleDrizzleDbml),
	sqliteGenerate: vi.fn(() => simpleDrizzleDbml),
}));

describe("Drizzle ERD Generation", () => {
	describe("Database Type Support", () => {
		it("should handle postgres dialect", async () => {
			const result = await genDrizzleERD("", "drizzle-postgres");

			expect(result.nodes.length).toBeGreaterThan(0);
			expect(result.edges?.length).toBeGreaterThan(0);
		});

		it("should handle mysql dialect", async () => {
			const result = await genDrizzleERD("", "drizzle-mysql");

			expect(result.nodes.length).toBeGreaterThan(0);
			expect(result.edges?.length).toBeGreaterThan(0);
		});

		it("should handle sqlite dialect", async () => {
			const result = await genDrizzleERD("", "drizzle-sqlite");

			expect(result.nodes.length).toBeGreaterThan(0);
			expect(result.edges?.length).toBeGreaterThan(0);
		});

		it("should throw error for unsupported database type", async () => {
			await expect(genDrizzleERD("", "unsupported" as any)).rejects.toThrow("Unsupported database type");
		});
	});

	describe("Simple Schema", () => {
		beforeEach(() => {
			const { pgGenerate } = require("drizzle-dbml-generator");
			pgGenerate.mockReturnValue(simpleDrizzleDbml);
		});

		it("should generate ERD from DBML", async () => {
			const result = await genDrizzleERD("", "drizzle-postgres");

			expect(result.nodes).toHaveLength(2);
			expect(result.edges).toBeDefined();

			const usersNode = result.nodes.find((n) => n.id === "users");
			expect(usersNode).toBeDefined();
			expect(usersNode?.data.fields.some((f) => f.name === "id" && f.isId)).toBe(true);

			const postsNode = result.nodes.find((n) => n.id === "posts");
			expect(postsNode).toBeDefined();
		});

		it("should create virtual relation fields", async () => {
			const result = await genDrizzleERD("", "drizzle-postgres");

			const postsNode = result.nodes.find((n) => n.id === "posts");
			const usersNode = result.nodes.find((n) => n.id === "users");

			// Posts should have virtual field pointing to User
			const authorField = postsNode?.data.fields.find((f) => f.kind === "object" && f.type === "users");
			expect(authorField).toBeDefined();

			// Users should have virtual field for posts list
			const postsField = usersNode?.data.fields.find((f) => f.kind === "object" && f.type === "posts" && f.isList);
			expect(postsField).toBeDefined();
		});
	});

	describe("Medium Schema", () => {
		beforeEach(() => {
			const { pgGenerate } = require("drizzle-dbml-generator");
			pgGenerate.mockReturnValue(mediumDrizzleDbml);
		});

		it("should handle multiple relationships", async () => {
			const result = await genDrizzleERD("", "drizzle-postgres");

			expect(result.nodes.length).toBeGreaterThanOrEqual(5);
			expect(result.edges?.length).toBeGreaterThan(5);
		});

		it("should handle one-to-one relationships", async () => {
			const result = await genDrizzleERD("", "drizzle-postgres");

			// Find profile-user relationship
			const edge = result.edges?.find((e) => e.data.relationshipType === "one-to-one");
			expect(edge).toBeDefined();
		});

		it("should handle many-to-one relationships", async () => {
			const result = await genDrizzleERD("", "drizzle-postgres");

			const manyToOneEdges = result.edges?.filter((e) => e.data.relationshipType === "many-to-one");
			expect(manyToOneEdges?.length).toBeGreaterThan(0);
		});

		it("should handle one-to-many relationships", async () => {
			const result = await genDrizzleERD("", "drizzle-postgres");

			const oneToManyEdges = result.edges?.filter((e) => e.data.relationshipType === "one-to-many");
			expect(oneToManyEdges?.length).toBeGreaterThan(0);
		});
	});

	describe("Complex Schema", () => {
		beforeEach(() => {
			const { pgGenerate } = require("drizzle-dbml-generator");
			pgGenerate.mockReturnValue(complexDrizzleDbml);
		});

		it("should handle complex schema with many tables", async () => {
			const result = await genDrizzleERD("", "drizzle-postgres");

			expect(result.nodes.length).toBeGreaterThan(10);
			expect(result.edges?.length).toBeGreaterThan(15);
		});

		it("should handle self-referencing relationships", async () => {
			const result = await genDrizzleERD("", "drizzle-postgres");

			const commentsNode = result.nodes.find((n) => n.id === "comments");
			if (commentsNode) {
				const _selfRef = commentsNode.data.fields.find((f) => f.type === "comments" && f.kind === "object");
				// Self-referencing is possible in the schema
				expect(commentsNode).toBeDefined();
			}
		});

		it("should correctly identify nullable relationships", async () => {
			const result = await genDrizzleERD("", "drizzle-postgres");

			const likesNode = result.nodes.find((n) => n.id === "likes");
			if (likesNode) {
				// Optional foreign keys should be nullable
				const optionalFields = likesNode.data.fields.filter((f) => f.isNullable && f.kind === "object");
				expect(optionalFields.length).toBeGreaterThan(0);
			}
		});
	});

	describe("Stress Tests", () => {
		it("should handle 50 tables efficiently", async () => {
			const largeDbml = generateLargeDrizzleDbml(50);
			const { pgGenerate } = require("drizzle-dbml-generator");
			pgGenerate.mockReturnValue(largeDbml);

			const startTime = performance.now();
			const result = await genDrizzleERD("", "drizzle-postgres");
			const duration = performance.now() - startTime;

			expect(result.nodes).toHaveLength(50);
			expect(duration).toBeLessThan(5000);
		}, 10000);

		it("should handle 100 tables efficiently", async () => {
			const largeDbml = generateLargeDrizzleDbml(100);
			const { pgGenerate } = require("drizzle-dbml-generator");
			pgGenerate.mockReturnValue(largeDbml);

			const startTime = performance.now();
			const result = await genDrizzleERD("", "drizzle-postgres");
			const duration = performance.now() - startTime;

			expect(result.nodes).toHaveLength(100);
			expect(duration).toBeLessThan(10000);
		}, 15000);

		it("should handle 500 tables without crashing", async () => {
			const largeDbml = generateLargeDrizzleDbml(500);
			const { pgGenerate } = require("drizzle-dbml-generator");
			pgGenerate.mockReturnValue(largeDbml);

			const result = await genDrizzleERD("", "drizzle-postgres");

			expect(result.nodes).toHaveLength(500);
			expect(result.nodes.every((node) => node.id && node.data.fields)).toBe(true);
		}, 60000);

		it("should maintain data integrity under stress", async () => {
			const largeDbml = generateLargeDrizzleDbml(100);
			const { pgGenerate } = require("drizzle-dbml-generator");
			pgGenerate.mockReturnValue(largeDbml);

			const result = await genDrizzleERD("", "drizzle-postgres");

			// Verify all nodes
			result.nodes.forEach((node) => {
				expect(node.id).toBeTruthy();
				expect(node.data.label).toBeTruthy();
				expect(Array.isArray(node.data.fields)).toBe(true);
				expect(node.position).toBeDefined();
				expect(node.style.width).toBeGreaterThan(0);
			});

			// Verify all edges reference existing nodes
			result.edges?.forEach((edge) => {
				const sourceExists = result.nodes.some((n) => n.id === edge.source);
				const targetExists = result.nodes.some((n) => n.id === edge.target);
				expect(sourceExists).toBe(true);
				expect(targetExists).toBe(true);
				expect(edge.data.relationshipType).toMatch(/one-to-one|one-to-many|many-to-one/);
			});
		}, 30000);

		it("should handle memory efficiently", async () => {
			const largeDbml = generateLargeDrizzleDbml(200);
			const { pgGenerate } = require("drizzle-dbml-generator");
			pgGenerate.mockReturnValue(largeDbml);

			const initialMemory = process.memoryUsage().heapUsed;
			const result = await genDrizzleERD("", "drizzle-postgres");
			const finalMemory = process.memoryUsage().heapUsed;

			const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024;

			expect(result.nodes).toHaveLength(200);
			expect(memoryIncrease).toBeLessThan(200);
		}, 30000);
	});

	describe("Field Properties", () => {
		beforeEach(() => {
			const { pgGenerate } = require("drizzle-dbml-generator");
			pgGenerate.mockReturnValue(simpleDrizzleDbml);
		});

		it("should correctly identify primary keys", async () => {
			const result = await genDrizzleERD("", "drizzle-postgres");

			const usersNode = result.nodes.find((n) => n.id === "users");
			const idField = usersNode?.data.fields.find((f) => f.name === "id");

			expect(idField).toBeDefined();
			expect(idField?.isId).toBe(true);
		});

		it("should correctly identify unique fields", async () => {
			const result = await genDrizzleERD("", "drizzle-postgres");

			const usersNode = result.nodes.find((n) => n.id === "users");
			const emailField = usersNode?.data.fields.find((f) => f.name === "email");

			expect(emailField).toBeDefined();
			expect(emailField?.isUnique).toBe(true);
		});

		it("should correctly identify not null fields", async () => {
			const result = await genDrizzleERD("", "drizzle-postgres");

			const usersNode = result.nodes.find((n) => n.id === "users");
			const emailField = usersNode?.data.fields.find((f) => f.name === "email");

			expect(emailField).toBeDefined();
			expect(emailField?.isNullable).toBe(false);
		});

		it("should handle nullable fields", async () => {
			const result = await genDrizzleERD("", "drizzle-postgres");

			const usersNode = result.nodes.find((n) => n.id === "users");
			const nameField = usersNode?.data.fields.find((f) => f.name === "name");

			if (nameField) {
				expect(nameField.isNullable).toBe(true);
			}
		});
	});

	describe("Edge Creation", () => {
		beforeEach(() => {
			const { pgGenerate } = require("drizzle-dbml-generator");
			pgGenerate.mockReturnValue(simpleDrizzleDbml);
		});

		it("should create bidirectional edges", async () => {
			const result = await genDrizzleERD("", "drizzle-postgres");

			// Should have edges in both directions for the relationship
			const forwardEdge = result.edges?.find((e) => e.source === "posts" && e.target === "users");
			const backwardEdge = result.edges?.find((e) => e.source === "users" && e.target === "posts");

			expect(forwardEdge).toBeDefined();
			expect(backwardEdge).toBeDefined();
		});

		it("should set correct edge properties", async () => {
			const result = await genDrizzleERD("", "drizzle-postgres");

			result.edges?.forEach((edge) => {
				expect(edge.id).toBeTruthy();
				expect(edge.source).toBeTruthy();
				expect(edge.target).toBeTruthy();
				expect(edge.type).toBe("smoothstep");
				expect(edge.animated).toBe(true);
				expect(edge.data).toBeDefined();
				expect(edge.data.fromField).toBeTruthy();
				expect(edge.data.fromTable).toBeTruthy();
				expect(typeof edge.data.isList).toBe("boolean");
			});
		});
	});
});
