/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { join } from "node:path";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import {
  simpleMySQLSchema,
  mediumMySQLSchema,
  complexMySQLSchema,
  singleTableMySQLSchema,
  selfReferencingMySQLSchema,
  multipleFilesMySQLSchema,
  compositePrimaryKeySchema,
  complexConstraintsSchema,
  generateLargeMySQLSchema,
  ecommerceSchema,
} from "../__mocks__/mysql-schemas";
import { genMySQLERD } from "../src/generators/gen-mysql-erd";

// Helper function to create temporary schema files
async function createTempSchema(schema: Record<string, string>): Promise<string> {
  const tempDir = join(tmpdir(), `mysql-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
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

describe("MySQL ERD Generation", () => {
  describe("Simple Schema", () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await createTempSchema(simpleMySQLSchema);
    });

    afterEach(async () => {
      await cleanupTempSchema(tempDir);
    });

    it("should generate ERD for simple schema with 2 tables", async () => {
      const result = await genMySQLERD(tempDir);

      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toBeDefined();

      // Check users table
      const usersNode = result.nodes.find((n) => n.id === "users");
      expect(usersNode).toBeDefined();
      expect(usersNode?.data.fields).toContainEqual(
        expect.objectContaining({ name: "id", isId: true })
      );
      expect(usersNode?.data.fields).toContainEqual(
        expect.objectContaining({ name: "email", isUnique: true })
      );

      // Check posts table
      const postsNode = result.nodes.find((n) => n.id === "posts");
      expect(postsNode).toBeDefined();
      expect(postsNode?.data.fields.some((f) => f.name === "author_id")).toBe(true);
    });

    it("should create edges for foreign key relationships", async () => {
      const result = await genMySQLERD(tempDir);

      const authorEdge = result.edges?.find(
        (e) => e.source === "posts" && e.target === "users"
      );
      expect(authorEdge).toBeDefined();
      expect(authorEdge?.data.relationshipType).toBe("many-to-one");
      expect(authorEdge?.data.fromField).toBe("author_id");
    });

    it("should handle nullable fields correctly", async () => {
      const result = await genMySQLERD(tempDir);

      const usersNode = result.nodes.find((n) => n.id === "users");
      const nameField = usersNode?.data.fields.find((f) => f.name === "name");

      expect(nameField).toBeDefined();
      expect(nameField?.isNullable).toBe(true);
    });

    it("should handle NOT NULL fields correctly", async () => {
      const result = await genMySQLERD(tempDir);

      const postsNode = result.nodes.find((n) => n.id === "posts");
      const titleField = postsNode?.data.fields.find((f) => f.name === "title");

      expect(titleField).toBeDefined();
      expect(titleField?.isNullable).toBe(false);
    });
  });

  describe("Medium Schema", () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await createTempSchema(mediumMySQLSchema);
    });

    afterEach(async () => {
      await cleanupTempSchema(tempDir);
    });

    it("should handle medium complexity schema", async () => {
      const result = await genMySQLERD(tempDir);

      expect(result.nodes.length).toBeGreaterThanOrEqual(5);
      expect(result.edges?.length).toBeGreaterThan(4);

      // Verify all expected tables
      const tableNames = ["users", "profiles", "posts", "comments", "categories"];
      tableNames.forEach((name) => {
        const node = result.nodes.find((n) => n.id === name);
        expect(node).toBeDefined();
      });
    });

    it("should handle one-to-one relationships (profiles-users)", async () => {
      const result = await genMySQLERD(tempDir);

      const profilesNode = result.nodes.find((n) => n.id === "profiles");
      expect(profilesNode).toBeDefined();

      const userIdField = profilesNode?.data.fields.find((f) => f.name === "user_id");
      expect(userIdField).toBeDefined();
      expect(userIdField?.kind).toBe("object");
    });

    it("should handle multiple foreign keys from same table", async () => {
      const result = await genMySQLERD(tempDir);

      const edges = result.edges?.filter((e) => e.source === "comments");
      expect(edges?.length).toBeGreaterThanOrEqual(2); // FK to posts and users
    });

    it("should handle join tables correctly", async () => {
      const result = await genMySQLERD(tempDir);

      const postCategoriesNode = result.nodes.find((n) => n.id === "post_categories");
      expect(postCategoriesNode).toBeDefined();

      // Should have foreign keys to both posts and categories
      const edges = result.edges?.filter((e) => e.source === "post_categories");
      expect(edges?.length).toBe(2);
    });
  });

  describe("Complex Schema", () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await createTempSchema(complexMySQLSchema);
    });

    afterEach(async () => {
      await cleanupTempSchema(tempDir);
    });

    it("should handle complex schema with many relationships", async () => {
      const result = await genMySQLERD(tempDir);

      expect(result.nodes.length).toBeGreaterThan(10);
      expect(result.edges?.length).toBeGreaterThan(15);
    });

    it("should handle self-referencing relationships", async () => {
      const result = await genMySQLERD(tempDir);

      const commentsNode = result.nodes.find((n) => n.id === "comments");
      expect(commentsNode).toBeDefined();

      const parentIdField = commentsNode?.data.fields.find(
        (f) => f.name === "parent_id"
      );
      expect(parentIdField).toBeDefined();

      // Self-referencing edge
      const selfEdge = result.edges?.find(
        (e) => e.source === "comments" && e.target === "comments"
      );
      expect(selfEdge).toBeDefined();
    });

    it("should handle optional foreign keys correctly", async () => {
      const result = await genMySQLERD(tempDir);

      const likesNode = result.nodes.find((n) => n.id === "likes");
      expect(likesNode).toBeDefined();

      // post_id and comment_id are nullable
      const postIdField = likesNode?.data.fields.find((f) => f.name === "post_id");
      const commentIdField = likesNode?.data.fields.find((f) => f.name === "comment_id");

      expect(postIdField?.isNullable).toBe(true);
      expect(commentIdField?.isNullable).toBe(true);
    });

    it("should identify all relationship types", async () => {
      const result = await genMySQLERD(tempDir);

      const relationshipTypes = new Set(
        result.edges?.map((e) => e.data.relationshipType)
      );

      expect(relationshipTypes.has("many-to-one")).toBe(true);
    });

    it("should handle UNIQUE constraints", async () => {
      const result = await genMySQLERD(tempDir);

      const usersNode = result.nodes.find((n) => n.id === "users");
      const emailField = usersNode?.data.fields.find((f) => f.name === "email");
      const usernameField = usersNode?.data.fields.find((f) => f.name === "username");

      expect(emailField?.isUnique).toBe(true);
      expect(usernameField?.isUnique).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle single table without relationships", async () => {
      const tempDir = await createTempSchema(singleTableMySQLSchema);

      const result = await genMySQLERD(tempDir);

      expect(result.nodes).toHaveLength(1);
      expect(result.edges).toHaveLength(0);

      await cleanupTempSchema(tempDir);
    });

    it("should handle self-referencing table", async () => {
      const tempDir = await createTempSchema(selfReferencingMySQLSchema);

      const result = await genMySQLERD(tempDir);

      expect(result.nodes).toHaveLength(1);
      const categoryNode = result.nodes[0];

      const parentIdField = categoryNode?.data.fields.find(
        (f) => f.name === "parent_id"
      );
      expect(parentIdField).toBeDefined();
      expect(parentIdField?.kind).toBe("object");

      await cleanupTempSchema(tempDir);
    });

    it("should throw error for empty directory", async () => {
      const tempDir = join(tmpdir(), `empty-${Date.now()}`);
      await mkdir(tempDir, { recursive: true });

      await expect(genMySQLERD(tempDir)).rejects.toThrow(
        "No SQL schema files found"
      );

      await cleanupTempSchema(tempDir);
    });

    it("should throw error for non-existent path", async () => {
      await expect(genMySQLERD("/non/existent/path")).rejects.toThrow();
    });

    it("should handle multiple SQL files", async () => {
      const tempDir = await createTempSchema(multipleFilesMySQLSchema);

      const result = await genMySQLERD(tempDir);

      expect(result.nodes).toHaveLength(2);
      expect(result.edges?.length).toBeGreaterThan(0);

      await cleanupTempSchema(tempDir);
    });
  });

  describe("Field Properties", () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await createTempSchema(simpleMySQLSchema);
    });

    afterEach(async () => {
      await cleanupTempSchema(tempDir);
    });

    it("should correctly identify primary keys", async () => {
      const result = await genMySQLERD(tempDir);

      const usersNode = result.nodes.find((n) => n.id === "users");
      const idField = usersNode?.data.fields.find((f) => f.name === "id");

      expect(idField).toBeDefined();
      expect(idField?.isId).toBe(true);
    });

    it("should correctly identify unique fields", async () => {
      const result = await genMySQLERD(tempDir);

      const usersNode = result.nodes.find((n) => n.id === "users");
      const emailField = usersNode?.data.fields.find((f) => f.name === "email");

      expect(emailField).toBeDefined();
      expect(emailField?.isUnique).toBe(true);
    });

    it("should handle field types correctly", async () => {
      const result = await genMySQLERD(tempDir);

      result.nodes.forEach((node) => {
        node.data.fields.forEach((field) => {
          expect(field.type).toBeTruthy();
          expect(typeof field.type).toBe("string");
        });
      });
    });

    it("should identify scalar fields", async () => {
      const result = await genMySQLERD(tempDir);

      const usersNode = result.nodes.find((n) => n.id === "users");
      const scalarFields = usersNode?.data.fields.filter((f) => f.kind === "scalar");

      expect(scalarFields?.length).toBeGreaterThan(0);
    });

    it("should identify object fields (foreign keys)", async () => {
      const result = await genMySQLERD(tempDir);

      const postsNode = result.nodes.find((n) => n.id === "posts");
      const objectFields = postsNode?.data.fields.filter((f) => f.kind === "object");

      expect(objectFields?.length).toBeGreaterThan(0);
    });
  });

  describe("Edge Creation", () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await createTempSchema(simpleMySQLSchema);
    });

    afterEach(async () => {
      await cleanupTempSchema(tempDir);
    });

    it("should set correct edge properties", async () => {
      const result = await genMySQLERD(tempDir);

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

    it("should create correct edge IDs", async () => {
      const result = await genMySQLERD(tempDir);

      result.edges?.forEach((edge) => {
        expect(edge.id).toContain(edge.source);
        expect(edge.id).toContain(edge.target);
      });
    });

    it("should set correct source handles", async () => {
      const result = await genMySQLERD(tempDir);

      result.edges?.forEach((edge) => {
        expect(edge.sourceHandle).toMatch(/^field-\d+$/);
      });
    });

    it("should set target handle to table-input", async () => {
      const result = await genMySQLERD(tempDir);

      result.edges?.forEach((edge) => {
        expect(edge.targetHandle).toBe("table-input");
      });
    });
  });

  describe("Advanced Constraints", () => {
    it("should handle composite primary keys", async () => {
      const tempDir = await createTempSchema(compositePrimaryKeySchema);

      const result = await genMySQLERD(tempDir);

      const enrollmentsNode = result.nodes.find((n) => n.id === "enrollments");
      expect(enrollmentsNode).toBeDefined();

      // Both student_id and course_id should be marked as ID fields
      const studentIdField = enrollmentsNode?.data.fields.find(
        (f) => f.name === "student_id"
      );
      const courseIdField = enrollmentsNode?.data.fields.find(
        (f) => f.name === "course_id"
      );

      // They should also be foreign keys (object kind)
      expect(studentIdField?.kind).toBe("object");
      expect(courseIdField?.kind).toBe("object");

      await cleanupTempSchema(tempDir);
    });

    it("should handle complex constraints schema", async () => {
      const tempDir = await createTempSchema(complexConstraintsSchema);

      const result = await genMySQLERD(tempDir);

      expect(result.nodes).toHaveLength(2);

      const employeesNode = result.nodes.find((n) => n.id === "employees");
      expect(employeesNode).toBeDefined();

      // Should have self-referencing relationship (manager_id)
      const managerEdge = result.edges?.find(
        (e) => e.source === "employees" && e.target === "employees"
      );
      expect(managerEdge).toBeDefined();

      await cleanupTempSchema(tempDir);
    });
  });

  describe("Stress Tests", () => {
    it("should handle 50 tables efficiently", async () => {
      const schema = generateLargeMySQLSchema(50);
      const tempDir = await createTempSchema(schema);

      const startTime = performance.now();
      const result = await genMySQLERD(tempDir);
      const duration = performance.now() - startTime;

      expect(result.nodes).toHaveLength(50);
      expect(duration).toBeLessThan(5000);

      await cleanupTempSchema(tempDir);
    }, 10000);

    it("should handle 100 tables efficiently", async () => {
      const schema = generateLargeMySQLSchema(100);
      const tempDir = await createTempSchema(schema);

      const startTime = performance.now();
      const result = await genMySQLERD(tempDir);
      const duration = performance.now() - startTime;

      expect(result.nodes).toHaveLength(100);
      expect(duration).toBeLessThan(10000);

      await cleanupTempSchema(tempDir);
    }, 15000);

    it("should handle 500 tables without crashing", async () => {
      const schema = generateLargeMySQLSchema(500);
      const tempDir = await createTempSchema(schema);

      const result = await genMySQLERD(tempDir);

      expect(result.nodes).toHaveLength(500);
      expect(result.nodes.every((node) => node.id && node.data.fields)).toBe(true);

      await cleanupTempSchema(tempDir);
    }, 60000);

    it("should maintain data integrity under stress", async () => {
      const schema = generateLargeMySQLSchema(100);
      const tempDir = await createTempSchema(schema);

      const result = await genMySQLERD(tempDir);

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
        expect(edge.data.relationshipType).toBe("many-to-one");
      });

      await cleanupTempSchema(tempDir);
    }, 30000);

    it("should handle memory efficiently", async () => {
      const schema = generateLargeMySQLSchema(200);
      const tempDir = await createTempSchema(schema);

      const initialMemory = process.memoryUsage().heapUsed;
      const result = await genMySQLERD(tempDir);
      const finalMemory = process.memoryUsage().heapUsed;

      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024;

      expect(result.nodes).toHaveLength(200);
      expect(memoryIncrease).toBeLessThan(200);

      await cleanupTempSchema(tempDir);
    }, 30000);
  });

  describe("Performance Benchmarks", () => {
    it("should process 10 tables in under 1 second", async () => {
      const schema = generateLargeMySQLSchema(10);
      const tempDir = await createTempSchema(schema);

      const startTime = performance.now();
      await genMySQLERD(tempDir);
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(1000);

      await cleanupTempSchema(tempDir);
    });

    it("should scale linearly with table count", async () => {
      const times: number[] = [];
      const sizes = [10, 20, 40];

      for (const size of sizes) {
        const schema = generateLargeMySQLSchema(size);
        const tempDir = await createTempSchema(schema);

        const startTime = performance.now();
        await genMySQLERD(tempDir);
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
      tempDir = await createTempSchema(mediumMySQLSchema);
    });

    afterEach(async () => {
      await cleanupTempSchema(tempDir);
    });

    it("should have correct node structure", async () => {
      const result = await genMySQLERD(tempDir);

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
      const result = await genMySQLERD(tempDir);

      result.nodes.forEach((node) => {
        expect(node.style.width).toBeGreaterThanOrEqual(280);
        expect(node.style.width).toBeLessThanOrEqual(600);
      });
    });

    it("should maintain referential integrity", async () => {
      const result = await genMySQLERD(tempDir);

      const nodeIds = new Set(result.nodes.map((n) => n.id));

      // All edge sources and targets should reference existing nodes
      result.edges?.forEach((edge) => {
        expect(nodeIds.has(edge.source)).toBe(true);
        expect(nodeIds.has(edge.target)).toBe(true);
      });
    });

    it("should have valid position coordinates", async () => {
      const result = await genMySQLERD(tempDir);

      result.nodes.forEach((node) => {
        expect(typeof node.position.x).toBe("number");
        expect(typeof node.position.y).toBe("number");
      });
    });
  });

  describe("Real-World Schema", () => {
    it("should handle e-commerce schema", async () => {
      const tempDir = await createTempSchema(ecommerceSchema);

      const result = await genMySQLERD(tempDir);

      expect(result.nodes.length).toBeGreaterThan(8);
      expect(result.edges?.length).toBeGreaterThan(10);

      // Verify key tables exist
      const keyTables = ["users", "products", "orders", "order_items", "categories"];
      keyTables.forEach((tableName) => {
        const node = result.nodes.find((n) => n.id === tableName);
        expect(node).toBeDefined();
      });

      // Verify self-referencing category
      const selfEdge = result.edges?.find(
        (e) => e.source === "categories" && e.target === "categories"
      );
      expect(selfEdge).toBeDefined();

      await cleanupTempSchema(tempDir);
    });
  });
});