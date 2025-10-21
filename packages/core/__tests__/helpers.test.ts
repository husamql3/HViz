/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { describe, expect, it } from "vitest";
import type { Field } from "../src/types/erd.type";
import { calcTableWidth } from "../src/utils/helpers/calc-table-width";
import { pluralize, removeIdSuffix, toCamelCase } from "../src/utils/helpers/drizzle-helpers";

describe("Helper Functions", () => {
	describe("toCamelCase", () => {
		it("should convert snake_case to camelCase", () => {
			expect(toCamelCase("user_id")).toBe("userId");
			expect(toCamelCase("first_name")).toBe("firstName");
			expect(toCamelCase("created_at_timestamp")).toBe("createdAtTimestamp");
		});

		it("should convert kebab-case to camelCase", () => {
			expect(toCamelCase("user-id")).toBe("userId");
			expect(toCamelCase("first-name")).toBe("firstName");
		});

		it("should handle already camelCase strings", () => {
			expect(toCamelCase("userId")).toBe("userId");
			expect(toCamelCase("firstName")).toBe("firstName");
		});

		it("should handle single words", () => {
			expect(toCamelCase("user")).toBe("user");
			expect(toCamelCase("id")).toBe("id");
		});

		it("should handle empty strings", () => {
			expect(toCamelCase("")).toBe("");
		});
	});

	describe("removeIdSuffix", () => {
		it("should remove _id suffix", () => {
			expect(removeIdSuffix("user_id")).toBe("user");
			expect(removeIdSuffix("author_id")).toBe("author");
		});

		it("should remove -id suffix", () => {
			expect(removeIdSuffix("user-id")).toBe("user");
			expect(removeIdSuffix("author-id")).toBe("author");
		});

		it("should not remove id from middle of string", () => {
			expect(removeIdSuffix("identifier")).toBe("identifier");
			expect(removeIdSuffix("id_user")).toBe("id_user");
		});

		it("should handle strings without id suffix", () => {
			expect(removeIdSuffix("user")).toBe("user");
			expect(removeIdSuffix("email")).toBe("email");
		});
	});

	describe("pluralize", () => {
		it("should pluralize regular words", () => {
			expect(pluralize("user")).toBe("users");
			expect(pluralize("post")).toBe("posts");
			expect(pluralize("comment")).toBe("comments");
		});

		it("should handle words ending in y", () => {
			expect(pluralize("category")).toBe("categories");
			expect(pluralize("company")).toBe("companies");
			expect(pluralize("story")).toBe("stories");
		});

		it("should not double pluralize", () => {
			expect(pluralize("users")).toBe("users");
			expect(pluralize("posts")).toBe("posts");
		});

		it("should handle edge cases", () => {
			expect(pluralize("toy")).toBe("toys"); // y after vowel
			expect(pluralize("boy")).toBe("boys"); // y after vowel
		});
	});

	describe("calcTableWidth", () => {
		it("should calculate width for simple fields", () => {
			const fields: Field[] = [
				{
					name: "id",
					type: "Int",
					isId: true,
					isUnique: false,
					isList: false,
					kind: "scalar",
					label: "id (ID)",
					isNullable: false,
				},
				{
					name: "email",
					type: "String",
					isId: false,
					isUnique: true,
					isList: false,
					kind: "scalar",
					label: "email",
					isNullable: false,
				},
			];

			const width = calcTableWidth(fields);
			expect(width).toBeGreaterThanOrEqual(280);
			expect(width).toBeLessThanOrEqual(600);
		});

		it("should handle long field names", () => {
			const fields: Field[] = [
				{
					name: "veryLongFieldNameThatShouldIncreaseWidth",
					type: "String",
					isId: false,
					isUnique: false,
					isList: false,
					kind: "scalar",
					label: "veryLongFieldNameThatShouldIncreaseWidth",
					isNullable: false,
				},
			];

			const width = calcTableWidth(fields);
			expect(width).toBeGreaterThan(280);
		});

		it("should respect maximum width", () => {
			const fields: Field[] = [
				{
					name: "a".repeat(100),
					type: "a".repeat(100),
					isId: false,
					isUnique: false,
					isList: false,
					kind: "scalar",
					label: "a".repeat(100),
					isNullable: false,
				},
			];

			const width = calcTableWidth(fields);
			expect(width).toBeLessThanOrEqual(600);
		});

		it("should respect minimum width", () => {
			const fields: Field[] = [
				{
					name: "a",
					type: "b",
					isId: false,
					isUnique: false,
					isList: false,
					kind: "scalar",
					label: "a",
					isNullable: false,
				},
			];

			const width = calcTableWidth(fields);
			expect(width).toBeGreaterThanOrEqual(280);
		});
	});
});
