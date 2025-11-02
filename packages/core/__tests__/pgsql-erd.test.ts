/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { join } from "node:path";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { simplePgsqlSchema, mediumPgsqlSchema } from "../__mocks__/pgsql-schemas";
import { genPgSQLERD } from "../src/generators/gen-pgsql-erd";

// Helper function to create temporary schema files
async function createTempSchema(schema: Record<string, string>): Promise<string> {
  const tempDir = join(tmpdir(), `pgsql-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
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
    // best-effort cleanup
    // keep tests non-failing on cleanup errors
  }
}

describe("PgSQL ERD Generation", () => {
  describe("Simple Schema", () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await createTempSchema(simplePgsqlSchema);
    });

    afterEach(async () => {
      await cleanupTempSchema(tempDir);
    });

    it("should generate ERD for simple schema with 2 tables", async () => {
      const result = await genPgSQLERD(tempDir);

      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toBeDefined();

      const usersNode = result.nodes.find((n) => n.id === "users");
      expect(usersNode).toBeDefined();
      expect(usersNode?.data.fields).toContainEqual(
        expect.objectContaining({ name: "id", isId: true })
      );
      expect(usersNode?.data.fields).toContainEqual(
        expect.objectContaining({ name: "email", isUnique: true })
      );

      const postsNode = result.nodes.find((n) => n.id === "posts");
      expect(postsNode).toBeDefined();
      expect(postsNode?.data.fields.some((f) => f.name === "author_id")).toBe(true);
    });

    it("should create edges for foreign key relationships", async () => {
      const result = await genPgSQLERD(tempDir);

      const authorEdge = result.edges?.find(
        (e) => e.source === "posts" && e.target === "users"
      );
      expect(authorEdge).toBeDefined();
      expect(authorEdge?.data.relationshipType).toBe("many-to-one");
      expect(authorEdge?.data.fromField).toBe("author_id");
    });
  });

  describe("Medium Schema", () => {
    let tempDir: string;

    beforeEach(async () => {
      tempDir = await createTempSchema(mediumPgsqlSchema);
    });

    afterEach(async () => {
      await cleanupTempSchema(tempDir);
    });

    it("should include expected tables and relationships", async () => {
      const result = await genPgSQLERD(tempDir);

      const expected = ["users", "profiles", "posts", "comments", "categories", "post_categories"];
      expected.forEach((name) => {
        const node = result.nodes.find((n) => n.id === name);
        expect(node).toBeDefined();
      });

      // profiles.user_id should be marked as object relation
      const profilesNode = result.nodes.find((n) => n.id === "profiles");
      const userIdField = profilesNode?.data.fields.find((f) => f.name === "user_id");
      expect(userIdField).toBeDefined();
      expect(userIdField?.kind).toBe("object");

      // join table should have two outgoing edges
      const pcEdges = result.edges?.filter((e) => e.source === "post_categories");
      expect(pcEdges?.length).toBe(2);
    });
  });
});