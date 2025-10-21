/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { describe, expect, it } from "vitest";
import {
	complexPrismaSchema,
	generateLargePrismaSchema,
	mediumPrismaSchema,
	selfReferencingPrismaSchema,
	simplePrismaSchema,
	singleTablePrismaSchema,
} from "../__mocks__/prisma-schemas";
import { genPrismaERD } from "../src/generators/gen-prisma-erd";

describe("Prisma ERD Generation", () => {
	describe("Simple Schema", () => {
		it("should generate ERD for simple schema with 2 tables", async () => {
			const result = await genPrismaERD(simplePrismaSchema);

			expect(result.nodes).toHaveLength(2);
			expect(result.edges).toBeDefined();
			expect(result.edges?.length).toBeGreaterThan(0);

			// Check User table
			const userNode = result.nodes.find((n) => n.id === "User");
			expect(userNode).toBeDefined();
			expect(userNode?.data.fields).toContainEqual(expect.objectContaining({ name: "id", isId: true }));
			expect(userNode?.data.fields).toContainEqual(expect.objectContaining({ name: "email", isUnique: true }));

			// Check Post table
			const postNode = result.nodes.find((n) => n.id === "Post");
			expect(postNode).toBeDefined();
			expect(postNode?.data.fields).toContainEqual(expect.objectContaining({ name: "author", kind: "object" }));
		});

		it("should create edges for relationships", async () => {
			const result = await genPrismaERD(simplePrismaSchema);

			const authorEdge = result.edges?.find((e) => e.id.includes("Post") && e.id.includes("author"));
			expect(authorEdge).toBeDefined();
			expect(authorEdge?.data.relationshipType).toBe("many-to-one");
		});
	});

	describe("Medium Schema", () => {
		it("should handle medium complexity schema", async () => {
			const result = await genPrismaERD(mediumPrismaSchema);

			expect(result.nodes).toHaveLength(5);
			expect(result.edges?.length).toBeGreaterThan(5);

			// Check for one-to-one relationship (User-Profile)
			const profileEdge = result.edges?.find((e) => e.id.includes("Profile") && e.id.includes("user"));
			expect(profileEdge).toBeDefined();

			// Check for many-to-many (Post-Category)
			const postNode = result.nodes.find((n) => n.id === "Post");
			expect(postNode?.data.fields).toContainEqual(expect.objectContaining({ name: "categories", isList: true }));
		});
	});

	describe("Complex Schema", () => {
		it("should handle complex schema with many relationships", async () => {
			const result = await genPrismaERD(complexPrismaSchema);

			expect(result.nodes.length).toBeGreaterThan(10);
			expect(result.edges?.length).toBeGreaterThan(15);

			// Check self-referencing relationship (Comment-Comment)
			const commentNode = result.nodes.find((n) => n.id === "Comment");
			expect(commentNode).toBeDefined();
			const repliesField = commentNode?.data.fields.find((f) => f.name === "replies");
			expect(repliesField).toBeDefined();
			expect(repliesField?.isList).toBe(true);
		});

		it("should handle optional foreign keys correctly", async () => {
			const result = await genPrismaERD(complexPrismaSchema);

			const likeNode = result.nodes.find((n) => n.id === "Like");
			expect(likeNode).toBeDefined();

			// postId and commentId are optional
			const postField = likeNode?.data.fields.find((f) => f.name === "post");
			const commentField = likeNode?.data.fields.find((f) => f.name === "comment");

			expect(postField).toBeDefined();
			expect(commentField).toBeDefined();
		});
	});

	describe("Edge Cases", () => {
		it("should handle single table without relationships", async () => {
			const result = await genPrismaERD(singleTablePrismaSchema);

			expect(result.nodes).toHaveLength(1);
			expect(result.edges).toHaveLength(0);
		});

		it("should handle self-referencing relationships", async () => {
			const result = await genPrismaERD(selfReferencingPrismaSchema);

			expect(result.nodes).toHaveLength(1);
			const categoryNode = result.nodes[0];

			const parentField = categoryNode?.data.fields.find((f) => f.name === "parent");
			const childrenField = categoryNode?.data.fields.find((f) => f.name === "children");

			expect(parentField).toBeDefined();
			expect(childrenField).toBeDefined();
			expect(childrenField?.isList).toBe(true);
		});
	});

	describe("Stress Tests", () => {
		it("should handle 50 tables efficiently", async () => {
			const largeSchema = generateLargePrismaSchema(50);
			const startTime = performance.now();

			const result = await genPrismaERD(largeSchema);

			const endTime = performance.now();
			const duration = endTime - startTime;

			expect(result.nodes).toHaveLength(50);
			expect(duration).toBeLessThan(5000); // Should complete in less than 5 seconds
		}, 10000);

		it("should handle 100 tables efficiently", async () => {
			const largeSchema = generateLargePrismaSchema(100);
			const startTime = performance.now();

			const result = await genPrismaERD(largeSchema);

			const endTime = performance.now();
			const duration = endTime - startTime;

			expect(result.nodes).toHaveLength(100);
			expect(duration).toBeLessThan(10000); // Should complete in less than 10 seconds
		}, 15000);

		it("should handle 500 tables without crashing", async () => {
			const largeSchema = generateLargePrismaSchema(500);

			const result = await genPrismaERD(largeSchema);

			expect(result.nodes).toHaveLength(500);
			expect(result.nodes.every((node) => node.id && node.data.fields)).toBe(true);
		}, 60000);

		it("should maintain data integrity under stress", async () => {
			const largeSchema = generateLargePrismaSchema(100);
			const result = await genPrismaERD(largeSchema);

			// Verify all nodes have required properties
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
			});
		}, 30000);

		it("should handle memory efficiently with large schemas", async () => {
			const largeSchema = generateLargePrismaSchema(200);

			const initialMemory = process.memoryUsage().heapUsed;
			const result = await genPrismaERD(largeSchema);
			const finalMemory = process.memoryUsage().heapUsed;

			const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB

			expect(result.nodes).toHaveLength(200);
			// Memory increase should be reasonable (less than 200MB for 200 tables)
			expect(memoryIncrease).toBeLessThan(200);
		}, 30000);
	});

	describe("Performance Benchmarks", () => {
		it("should process 10 tables in under 1 second", async () => {
			const schema = generateLargePrismaSchema(10);
			const startTime = performance.now();

			await genPrismaERD(schema);

			const duration = performance.now() - startTime;
			expect(duration).toBeLessThan(1000);
		});

		it("should scale linearly with table count", async () => {
			const times: number[] = [];
			const sizes = [10, 20, 40];

			for (const size of sizes) {
				const schema = generateLargePrismaSchema(size);
				const startTime = performance.now();
				await genPrismaERD(schema);
				times.push(performance.now() - startTime);
			}

			// Check if time roughly doubles when size doubles
			const ratio = times[2]! / times[1]!;
			expect(ratio).toBeLessThan(3); // Should be roughly 2x, allowing some variance
		}, 30000);
	});
});
