/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { join } from "node:path";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import {
  simpleTypeORMSchema,
  mediumTypeORMSchema,
  complexTypeORMSchema,
  singleTableTypeORMSchema,
  selfReferencingTypeORMSchema,
  generateLargeTypeORMSchema,
} from "../__mocks__/typeorm-schemas";
import { genTypeORMERD } from "../src/generators/gen-typeorm-erd";

// Helper function to create temporary schema files
async function createTempSchema(schema: Record<string, string>): Promise<string> {
  const tempDir = join(tmpdir(), `typeorm-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  await mkdir(tempDir, { recursive: true });

  for (const [filename, content] of Object.entries(schema)) {
    await writeFile(join(tempDir, filename), content, "utf-8");
  }

  return tempDir;
}

// Helper function to clean up temporary directory
async function cleanupTempSchema(tempDir: string): Promise<void> {
  try {
    await rm(tempDir, { recursive: true, force: true });
  } catch (error) {
    console.warn(`Warning: Could not clean up ${tempDir}:`, error);
  }
}

it("should throw error for empty directory", async () => {
  const tempDir = join(tmpdir(), `empty-${Date.now()}`);
  await mkdir(tempDir, { recursive: true });

  await expect(genTypeORMERD(tempDir)).rejects.toThrow(
    "No TypeScript files found"
  );

  await cleanupTempSchema(tempDir);
});

describe("TypeORM ERD Generation", () => {
  describe("Simple Schema", () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await createTempSchema(simpleTypeORMSchema);
    });

    afterEach(async () => {
      await cleanupTempSchema(tempDir);
    });

    it("should generate ERD for simple schema with 2 entities", async () => {
      const result = await genTypeORMERD(tempDir);

      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toBeDefined();

      // Check User entity
      const userNode = result.nodes.find((n) => n.id === "User");
      expect(userNode).toBeDefined();
      expect(userNode?.data.fields).toContainEqual(
        expect.objectContaining({ name: "id", isId: true })
      );
      expect(userNode?.data.fields).toContainEqual(
        expect.objectContaining({ name: "email", isUnique: true })
      );

      // Check Post entity
      const postNode = result.nodes.find((n) => n.id === "Post");
      expect(postNode).toBeDefined();
      expect(postNode?.data.fields).toContainEqual(
        expect.objectContaining({ name: "author", kind: "object" })
      );
    });

    it("should create edges for relationships", async () => {
      const result = await genTypeORMERD(tempDir);

      const authorEdge = result.edges?.find(
        (e) => e.source === "Post" && e.target === "User"
      );
      expect(authorEdge).toBeDefined();
      expect(authorEdge?.data.relationshipType).toBe("many-to-one");
    });

    it("should handle OneToMany relationships", async () => {
      const result = await genTypeORMERD(tempDir);

      const userNode = result.nodes.find((n) => n.id === "User");
      const postsField = userNode?.data.fields.find(
        (f) => f.name === "posts" && f.kind === "object"
      );

      expect(postsField).toBeDefined();
      expect(postsField?.isList).toBe(true);
    });
  });

  describe("Medium Schema", () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await createTempSchema(mediumTypeORMSchema);
    });

    afterEach(async () => {
      await cleanupTempSchema(tempDir);
    });

    it("should handle medium complexity schema", async () => {
      const result = await genTypeORMERD(tempDir);

      expect(result.nodes).toHaveLength(5);
      expect(result.edges?.length).toBeGreaterThan(5);

      // Verify all expected entities
      const entityNames = ["User", "Profile", "Post", "Comment", "Category"];
      entityNames.forEach((name) => {
        const node = result.nodes.find((n) => n.id === name);
        expect(node).toBeDefined();
      });
    });

    it("should handle OneToOne relationships", async () => {
      const result = await genTypeORMERD(tempDir);

      const profileEdge = result.edges?.find(
        (e) => e.source === "Profile" && e.target === "User"
      );
      expect(profileEdge).toBeDefined();
      expect(profileEdge?.data.relationshipType).toBe("one-to-one");
    });

    it("should handle ManyToMany relationships", async () => {
      const result = await genTypeORMERD(tempDir);

      const postNode = result.nodes.find((n) => n.id === "Post");
      const categoriesField = postNode?.data.fields.find(
        (f) => f.name === "categories" && f.kind === "object"
      );

      expect(categoriesField).toBeDefined();
      expect(categoriesField?.isList).toBe(true);

      const categoryEdge = result.edges?.find(
        (e) => e.source === "Post" && e.target === "Category"
      );
      expect(categoryEdge?.data.relationshipType).toBe("many-to-many");
    });
  });

  describe("Complex Schema", () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await createTempSchema(complexTypeORMSchema);
    });

    afterEach(async () => {
      await cleanupTempSchema(tempDir);
    });

    it("should handle complex schema with many relationships", async () => {
      const result = await genTypeORMERD(tempDir);

      expect(result.nodes.length).toBeGreaterThan(10);
      expect(result.edges?.length).toBeGreaterThan(15);
    });

    it("should handle self-referencing relationships", async () => {
      const result = await genTypeORMERD(tempDir);

      const commentNode = result.nodes.find((n) => n.id === "Comment");
      expect(commentNode).toBeDefined();

      const repliesField = commentNode?.data.fields.find(
        (f) => f.name === "replies" && f.kind === "object"
      );
      expect(repliesField).toBeDefined();
      expect(repliesField?.isList).toBe(true);
      expect(repliesField?.type).toBe("Comment");
    });

    it("should handle optional relationships correctly", async () => {
      const result = await genTypeORMERD(tempDir);

      const likeNode = result.nodes.find((n) => n.id === "Like");
      expect(likeNode).toBeDefined();

      // postId and commentId are optional
      const postField = likeNode?.data.fields.find((f) => f.name === "post");
      const commentField = likeNode?.data.fields.find((f) => f.name === "comment");

      expect(postField).toBeDefined();
      expect(commentField).toBeDefined();
      expect(postField?.isNullable).toBe(true);
      expect(commentField?.isNullable).toBe(true);
    });

    it("should identify all relationship types", async () => {
      const result = await genTypeORMERD(tempDir);

      const relationshipTypes = new Set(
        result.edges?.map((e) => e.data.relationshipType)
      );

      expect(relationshipTypes.has("one-to-one")).toBe(true);
      expect(relationshipTypes.has("one-to-many")).toBe(true);
      expect(relationshipTypes.has("many-to-one")).toBe(true);
      expect(relationshipTypes.has("many-to-many")).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle single entity without relationships", async () => {
      const tempDir = await createTempSchema(singleTableTypeORMSchema);

      const result = await genTypeORMERD(tempDir);

      expect(result.nodes).toHaveLength(1);
      expect(result.edges).toHaveLength(0);

      await cleanupTempSchema(tempDir);
    });

    it("should handle self-referencing entity", async () => {
      const tempDir = await createTempSchema(selfReferencingTypeORMSchema);

      const result = await genTypeORMERD(tempDir);

      expect(result.nodes).toHaveLength(1);
      const categoryNode = result.nodes[0];

      const parentField = categoryNode?.data.fields.find((f) => f.name === "parent");
      const childrenField = categoryNode?.data.fields.find(
        (f) => f.name === "children"
      );

      expect(parentField).toBeDefined();
      expect(childrenField).toBeDefined();
      expect(childrenField?.isList).toBe(true);
      expect(parentField?.type).toBe("Category");
      expect(childrenField?.type).toBe("Category");

      await cleanupTempSchema(tempDir);
    });

    it("should throw error for empty directory", async () => {
      const tempDir = join(tmpdir(), `empty-${Date.now()}`);
      await mkdir(tempDir, { recursive: true });

      await expect(genTypeORMERD(tempDir)).rejects.toThrow(
        "No TypeScript files found"
      );

      await cleanupTempSchema(tempDir);
    });

    it("should throw error for non-existent path", async () => {
      await expect(
        genTypeORMERD("/non/existent/path")
      ).rejects.toThrow();
    });
  });

  describe("Field Properties", () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await createTempSchema(simpleTypeORMSchema);
    });

    afterEach(async () => {
      await cleanupTempSchema(tempDir);
    });

    it("should correctly identify primary keys", async () => {
      const result = await genTypeORMERD(tempDir);

      const userNode = result.nodes.find((n) => n.id === "User");
      const idField = userNode?.data.fields.find((f) => f.name === "id");

      expect(idField).toBeDefined();
      expect(idField?.isId).toBe(true);
    });

    it("should correctly identify unique fields", async () => {
      const result = await genTypeORMERD(tempDir);

      const userNode = result.nodes.find((n) => n.id === "User");
      const emailField = userNode?.data.fields.find((f) => f.name === "email");

      expect(emailField).toBeDefined();
      expect(emailField?.isUnique).toBe(true);
    });

    it("should handle nullable fields", async () => {
      const result = await genTypeORMERD(tempDir);

      const userNode = result.nodes.find((n) => n.id === "User");
      const nameField = userNode?.data.fields.find((f) => f.name === "name");

      expect(nameField).toBeDefined();
      expect(nameField?.isNullable).toBe(true);
    });

    it("should handle required fields", async () => {
      const result = await genTypeORMERD(tempDir);

      const postNode = result.nodes.find((n) => n.id === "Post");
      const titleField = postNode?.data.fields.find((f) => f.name === "title");

      expect(titleField).toBeDefined();
      expect(titleField?.isNullable).toBe(false);
    });
  });

  describe("Edge Creation", () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await createTempSchema(simpleTypeORMSchema);
    });

    afterEach(async () => {
      await cleanupTempSchema(tempDir);
    });

    it("should set correct edge properties", async () => {
      const result = await genTypeORMERD(tempDir);

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

    it("should create bidirectional edges for relationships", async () => {
      const result = await genTypeORMERD(tempDir);

      // OneToMany and ManyToOne create edges in both directions
      const userToPostEdge = result.edges?.find(
        (e) => e.source === "User" && e.target === "Post"
      );
      const postToUserEdge = result.edges?.find(
        (e) => e.source === "Post" && e.target === "User"
      );

      expect(userToPostEdge).toBeDefined();
      expect(postToUserEdge).toBeDefined();
    });
  });

  describe("Stress Tests", () => {
    it("should handle 50 entities efficiently", async () => {
      const schema = generateLargeTypeORMSchema(50);
      const tempDir = await createTempSchema(schema);

      const startTime = performance.now();
      const result = await genTypeORMERD(tempDir);
      const duration = performance.now() - startTime;

      expect(result.nodes).toHaveLength(50);
      expect(duration).toBeLessThan(5000);

      await cleanupTempSchema(tempDir);
    }, 10000);

    it("should handle 100 entities efficiently", async () => {
      const schema = generateLargeTypeORMSchema(100);
      const tempDir = await createTempSchema(schema);

      const startTime = performance.now();
      const result = await genTypeORMERD(tempDir);
      const duration = performance.now() - startTime;

      expect(result.nodes).toHaveLength(100);
      expect(duration).toBeLessThan(10000);

      await cleanupTempSchema(tempDir);
    }, 15000);

    it("should handle 500 entities without crashing", async () => {
      const schema = generateLargeTypeORMSchema(500);
      const tempDir = await createTempSchema(schema);

      const result = await genTypeORMERD(tempDir);

      expect(result.nodes).toHaveLength(500);
      expect(result.nodes.every((node) => node.id && node.data.fields)).toBe(true);

      await cleanupTempSchema(tempDir);
    }, 60000);

    it("should maintain data integrity under stress", async () => {
      const schema = generateLargeTypeORMSchema(100);
      const tempDir = await createTempSchema(schema);

      const result = await genTypeORMERD(tempDir);

      // Verify all nodes
      result.nodes.forEach((node) => {
        expect(node.id).toBeTruthy();
        expect(node.data.label).toBeTruthy();
        expect(Array.isArray(node.data.fields)).toBe(true);
        expect(node.position).toBeDefined();
        expect(node.style.width).toBeGreaterThan(0);
      });

      // Verify all edges reference existing nodes
      const nodeIds = new Set(result.nodes.map((n) => n.id));
      result.edges?.forEach((edge) => {
        expect(nodeIds.has(edge.source)).toBe(true);
        expect(nodeIds.has(edge.target)).toBe(true);
        expect(edge.data.relationshipType).toMatch(
          /one-to-one|one-to-many|many-to-one|many-to-many/
        );
      });

      await cleanupTempSchema(tempDir);
    }, 30000);

    it("should handle memory efficiently", async () => {
      const schema = generateLargeTypeORMSchema(200);
      const tempDir = await createTempSchema(schema);

      const initialMemory = process.memoryUsage().heapUsed;
      const result = await genTypeORMERD(tempDir);
      const finalMemory = process.memoryUsage().heapUsed;

      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024;

      expect(result.nodes).toHaveLength(200);
      expect(memoryIncrease).toBeLessThan(200);

      await cleanupTempSchema(tempDir);
    }, 30000);
  });

  describe("Performance Benchmarks", () => {
    it("should process 10 entities in under 1 second", async () => {
      const schema = generateLargeTypeORMSchema(10);
      const tempDir = await createTempSchema(schema);

      const startTime = performance.now();
      await genTypeORMERD(tempDir);
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(1000);

      await cleanupTempSchema(tempDir);
    });

    it("should scale linearly with entity count", async () => {
      const times: number[] = [];
      const sizes = [10, 20, 40];

      for (const size of sizes) {
        const schema = generateLargeTypeORMSchema(size);
        const tempDir = await createTempSchema(schema);

        const startTime = performance.now();
        await genTypeORMERD(tempDir);
        times.push(performance.now() - startTime);

        await cleanupTempSchema(tempDir);
      }

      // Check if time roughly doubles when size doubles
      const ratio = times[2]! / times[1]!;
      expect(ratio).toBeLessThan(5); 
    }, 30000);
  });

  describe("Node Structure", () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await createTempSchema(mediumTypeORMSchema);
    });

    afterEach(async () => {
      await cleanupTempSchema(tempDir);
    });

    it("should have correct node structure", async () => {
      const result = await genTypeORMERD(tempDir);

      result.nodes.forEach((node) => {
        expect(node).toHaveProperty("id");
        expect(node).toHaveProperty("type");
        expect(node).toHaveProperty("data");
        expect(node.data).toHaveProperty("label");
        expect(node.data).toHaveProperty("fields");
        expect(node).toHaveProperty("position");
        expect(node).toHaveProperty("style");
        expect(node.style).toHaveProperty("width");
      });
    });

    it("should calculate reasonable table widths", async () => {
      const result = await genTypeORMERD(tempDir);

      result.nodes.forEach((node) => {
        expect(node.style.width).toBeGreaterThanOrEqual(280);
        expect(node.style.width).toBeLessThanOrEqual(600);
      });
    });

    it("should maintain referential integrity", async () => {
      const result = await genTypeORMERD(tempDir);

      const nodeIds = new Set(result.nodes.map((n) => n.id));

      // All edge sources and targets should reference existing nodes
      result.edges?.forEach((edge) => {
        expect(nodeIds.has(edge.source)).toBe(true);
        expect(nodeIds.has(edge.target)).toBe(true);
      });

      // All object-type fields should reference existing entities
      result.nodes.forEach((node) => {
        node.data.fields.forEach((field) => {
          if (field.kind === "object") {
            expect(nodeIds.has(field.type)).toBe(true);
          }
        });
      });
    });
  });
});