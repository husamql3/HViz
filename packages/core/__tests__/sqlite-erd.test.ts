/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { join } from "node:path";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import {
  simpleSQLiteSchema,
  mediumSQLiteSchema,
  complexSQLiteSchema,
  singleTableSQLiteSchema,
  selfReferencingSQLiteSchema,
  multipleFilesSQLiteSchema,
  compositePrimaryKeySQLiteSchema,
  complexConstraintsSQLiteSchema,
  generateLargeSQLiteSchema,
  ecommerceSQLiteSchema,
} from "../__mocks__/sqlite-schemas";
import { genSqliteERD } from "../src/generators/gen-sqlite-erd";

// Helper function to create temporary schema files
async function createTempSchema(schema: Record<string, string>): Promise<string> {
  const tempDir = join(tmpdir(), `sqlite-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
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

describe("SQLite ERD Generation", () => {
  describe("Simple Schema", () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await createTempSchema(simpleSQLiteSchema);
    });

    afterEach(async () => {
      await cleanupTempSchema(tempDir);
    });

    it("should generate ERD for simple schema with 2 tables", async () => {
      const result = await genSqliteERD(tempDir);

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
      const result = await genSqliteERD(tempDir);

      const authorEdge = result.edges?.find(
        (e) => e.source === "posts" && e.target === "users"
      );
      expect(authorEdge).toBeDefined();
      expect(authorEdge?.data.relationshipType).toBe("many-to-one");
      expect(authorEdge?.data.fromField).toBe("author_id");
    });

    it("should handle NOT NULL fields correctly", async () => {
      const result = await genSqliteERD(tempDir);

      const postsNode = result.nodes.find((n) => n.id === "posts");
      const titleField = postsNode?.data.fields.find((f) => f.name === "title");

      expect(titleField).toBeDefined();
      expect(titleField?.isNullable).toBe(false);
    });
  });

  describe("Medium Schema", () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await createTempSchema(mediumSQLiteSchema);
    });

    afterEach(async () => {
      await cleanupTempSchema(tempDir);
    });

    it("should handle medium complexity schema", async () => {
      const result = await genSqliteERD(tempDir);

      expect(result.nodes.length).toBeGreaterThanOrEqual(5);
      expect(result.edges?.length).toBeGreaterThan(4);

      const tableNames = ["users", "profiles", "posts", "comments", "categories"];
      tableNames.forEach((name) => {
        const node = result.nodes.find((n) => n.id === name);
        expect(node).toBeDefined();
      });
    });

    it("should handle one-to-one relationships (profiles-users)", async () => {
      const result = await genSqliteERD(tempDir);

      const profilesNode = result.nodes.find((n) => n.id === "profiles");
      expect(profilesNode).toBeDefined();

      const userIdField = profilesNode?.data.fields.find((f) => f.name === "user_id");
      expect(userIdField).toBeDefined();
      expect(userIdField?.kind).toBe("object");
    });

    it("should handle join tables correctly", async () => {
      const result = await genSqliteERD(tempDir);

      const postCategoriesNode = result.nodes.find((n) => n.id === "post_categories");
      expect(postCategoriesNode).toBeDefined();

      const edges = result.edges?.filter((e) => e.source === "post_categories");
      expect(edges?.length).toBe(2);
    });
  });

  describe("Complex Schema", () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await createTempSchema(complexSQLiteSchema);
    });

    afterEach(async () => {
      await cleanupTempSchema(tempDir);
    });

    it("should handle complex schema with many relationships", async () => {
      const result = await genSqliteERD(tempDir);

      expect(result.nodes.length).toBeGreaterThan(10);
      expect(result.edges?.length).toBeGreaterThan(15);
    });

    it("should handle self-referencing relationships", async () => {
      const result = await genSqliteERD(tempDir);

      const commentsNode = result.nodes.find((n) => n.id === "comments");
      expect(commentsNode).toBeDefined();

      const parentIdField = commentsNode?.data.fields.find((f) => f.name === "parent_id");
      expect(parentIdField).toBeDefined();

      const selfEdge = result.edges?.find((e) => e.source === "comments" && e.target === "comments");
      expect(selfEdge).toBeDefined();
    });

    it("should handle UNIQUE constraints", async () => {
      const result = await genSqliteERD(tempDir);

      const usersNode = result.nodes.find((n) => n.id === "users");
      const emailField = usersNode?.data.fields.find((f) => f.name === "email");
      const usernameField = usersNode?.data.fields.find((f) => f.name === "username");

      expect(emailField?.isUnique).toBe(true);
      expect(usernameField?.isUnique).toBe(true);
    });
  });

  describe("Edge Cases & Advanced Constraints", () => {
    it("should handle single table without relationships", async () => {
      const tempDir = await createTempSchema(singleTableSQLiteSchema);

      const result = await genSqliteERD(tempDir);

      expect(result.nodes).toHaveLength(1);
      expect(result.edges).toHaveLength(0);

      await cleanupTempSchema(tempDir);
    });

    it("should handle self-referencing table", async () => {
      const tempDir = await createTempSchema(selfReferencingSQLiteSchema);

      const result = await genSqliteERD(tempDir);

      expect(result.nodes).toHaveLength(1);
      const categoryNode = result.nodes[0];

      const parentIdField = categoryNode?.data.fields.find((f) => f.name === "parent_id");
      expect(parentIdField).toBeDefined();
      expect(parentIdField?.kind).toBe("object");

      await cleanupTempSchema(tempDir);
    });

    it("should handle multiple SQL files", async () => {
      const tempDir = await createTempSchema(multipleFilesSQLiteSchema);

      const result = await genSqliteERD(tempDir);

      expect(result.nodes).toHaveLength(2);
      expect(result.edges?.length).toBeGreaterThan(0);

      await cleanupTempSchema(tempDir);
    });

    it("should handle composite primary keys", async () => {
      const tempDir = await createTempSchema(compositePrimaryKeySQLiteSchema);

      const result = await genSqliteERD(tempDir);

      const enrollmentsNode = result.nodes.find((n) => n.id === "enrollments");
      expect(enrollmentsNode).toBeDefined();

      const studentIdField = enrollmentsNode?.data.fields.find((f) => f.name === "student_id");
      const courseIdField = enrollmentsNode?.data.fields.find((f) => f.name === "course_id");

      expect(studentIdField?.kind).toBe("object");
      expect(courseIdField?.kind).toBe("object");

      await cleanupTempSchema(tempDir);
    });

    it("should handle complex constraints schema", async () => {
      const tempDir = await createTempSchema(complexConstraintsSQLiteSchema);

      const result = await genSqliteERD(tempDir);

      expect(result.nodes).toHaveLength(2);

      const employeesNode = result.nodes.find((n) => n.id === "employees");
      expect(employeesNode).toBeDefined();

      const managerEdge = result.edges?.find((e) => e.source === "employees" && e.target === "employees");
      expect(managerEdge).toBeDefined();

      await cleanupTempSchema(tempDir);
    });
  });

  describe("Performance & Stress", () => {
    it("should handle 50 tables efficiently", async () => {
      const schema = generateLargeSQLiteSchema(50);
      const tempDir = await createTempSchema(schema);

      const startTime = performance.now();
      const result = await genSqliteERD(tempDir);
      const duration = performance.now() - startTime;

      expect(result.nodes).toHaveLength(50);
      expect(duration).toBeLessThan(5000);

      await cleanupTempSchema(tempDir);
    }, 10000);

    it("should handle ecommerce real-world schema", async () => {
      const tempDir = await createTempSchema(ecommerceSQLiteSchema);

      const result = await genSqliteERD(tempDir);

      expect(result.nodes.length).toBeGreaterThan(8);
      expect(result.edges?.length).toBeGreaterThan(10);

      const keyTables = ["users", "products", "orders", "order_items", "categories"];
      keyTables.forEach((tableName) => {
        const node = result.nodes.find((n) => n.id === tableName);
        expect(node).toBeDefined();
      });

      const selfEdge = result.edges?.find((e) => e.source === "categories" && e.target === "categories");
      expect(selfEdge).toBeDefined();

      await cleanupTempSchema(tempDir);
    });
  });
});