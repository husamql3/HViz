import { join, extname } from "node:path";
import { readdir, stat, readFile } from "node:fs/promises";

import type { Edge, ErdResult, Node, Field } from "../types/erd.type";
import { calcTableWidth } from "../utils/helpers/calc-table-width";

interface ParsedEntity {
  name: string;
  fields: Field[];
  relations: ParsedRelation[];
}

interface ParsedRelation {
  fieldName: string;
  type: string;
  relationType: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";
  targetEntity: string;
  isNullable: boolean;
}

/**
 * Recursively get all TypeScript files from a directory
 */
async function getTypeScriptFiles(path: string): Promise<string[]> {
  const files: string[] = [];

  try {
    const stats = await stat(path);

    if (stats.isFile()) {
      if (extname(path) === ".ts" || extname(path) === ".js") {
        files.push(path);
      }
      return files;
    }

    if (stats.isDirectory()) {
      const entries = await readdir(path, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(path, entry.name);

        if (entry.isDirectory()) {
          // Skip node_modules and common build directories
          if (!["node_modules", "dist", "build", ".git"].includes(entry.name)) {
            const subFiles = await getTypeScriptFiles(fullPath);
            files.push(...subFiles);
          }
        } else if (entry.isFile() && (extname(entry.name) === ".ts" || extname(entry.name) === ".js")) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not access ${path}`);
  }

  return files;
}

/**
 * Parse TypeORM entity decorators from file content
 */
function parseTypeORMEntity(content: string, fileName: string): ParsedEntity | null {
  // Check if file contains @Entity decorator
  if (!content.includes("@Entity")) {
    return null;
  }

  // Extract class name
  const classMatch = content.match(/class\s+(\w+)/);
  if (!classMatch) return null;

  const entityName = classMatch[1];
  const fields: Field[] = [];
  const relations: ParsedRelation[] = [];

  // Parse columns
  const columnRegex = /@Column\((.*?)\)[\s\S]*?(\w+)(?:\?)?:\s*(\w+(?:\[\])?)/g;
  let columnMatch;

  while ((columnMatch = columnRegex.exec(content)) !== null) {
    const options = columnMatch[1];
    const fieldName = columnMatch[2];
    const fieldType = columnMatch[3];

    const isNullable = options?.includes("nullable: true") || content.includes(`${fieldName}?:`);
    const isUnique = options?.includes("unique: true");

    fields.push({
      name: fieldName || "",
      type: fieldType?.replace("[]", "") || "",
      isId: false,
      isUnique: isUnique || false,
      isList: fieldType?.includes("[]") || false,
      kind: "scalar",
      label: fieldName || "",
      isNullable,
    });
  }

  // Parse primary columns
  const primaryRegex = /@PrimaryGeneratedColumn\((.*?)\)[\s\S]*?(\w+)(?:\?)?:\s*(\w+)/g;
  let primaryMatch;

  while ((primaryMatch = primaryRegex.exec(content)) !== null) {
    const fieldName = primaryMatch[2];
    const fieldType = primaryMatch[3];

    fields.push({
      name: fieldName || "",
      type: fieldType || "",
      isId: true,
      isUnique: true,
      isList: false,
      kind: "scalar",
      label: `${fieldName || ""} (ID)`,
      isNullable: false,
    });
  }

  // Parse @PrimaryColumn
  const primaryColRegex = /@PrimaryColumn\((.*?)\)[\s\S]*?(\w+)(?:\?)?:\s*(\w+)/g;
  let primaryColMatch;

  while ((primaryColMatch = primaryColRegex.exec(content)) !== null) {
    const fieldName = primaryColMatch[2];
    const fieldType = primaryColMatch[3];

    fields.push({
      name: fieldName || "",
      type: fieldType || "",
      isId: true,
      isUnique: true,
      isList: false,
      kind: "scalar",
      label: `${fieldName} (ID)`,
      isNullable: false,
    });
  }

  // Parse OneToOne relations
  const oneToOneRegex = /@OneToOne\(\s*\(\)\s*=>\s*(\w+).*?\)[\s\S]*?(\w+)(?:\?)?:\s*(\w+)/g;
  let oneToOneMatch;

  while ((oneToOneMatch = oneToOneRegex.exec(content)) !== null) {
    const targetEntity = oneToOneMatch[1];
    const fieldName = oneToOneMatch[2];
    const isNullable = content.includes(`${fieldName}?:`);

    relations.push({
      fieldName: fieldName || "",
      type: targetEntity || "",
      relationType: "one-to-one",
      targetEntity: targetEntity || "",
      isNullable,
    });
  }

  // Parse OneToMany relations
  const oneToManyRegex = /@OneToMany\(\s*\(\)\s*=>\s*(\w+).*?\)[\s\S]*?(\w+)(?:\?)?:\s*(\w+)(?:\[\])?/g;
  let oneToManyMatch;

  while ((oneToManyMatch = oneToManyRegex.exec(content)) !== null) {
    const targetEntity = oneToManyMatch[1];
    const fieldName = oneToManyMatch[2];
    const isNullable = content.includes(`${fieldName}?:`);

    relations.push({
      fieldName: fieldName || "",
      type: targetEntity || "",
      relationType: "one-to-many",
      targetEntity: targetEntity || "",
      isNullable,
    });
  }

  // Parse ManyToOne relations
  const manyToOneRegex = /@ManyToOne\(\s*\(\)\s*=>\s*(\w+).*?\)[\s\S]*?(\w+)(?:\?)?:\s*(\w+)/g;
  let manyToOneMatch;

  while ((manyToOneMatch = manyToOneRegex.exec(content)) !== null) {
    const targetEntity = manyToOneMatch[1];
    const fieldName = manyToOneMatch[2];
    const isNullable = content.includes(`${fieldName}?:`);

    relations.push({
      fieldName: fieldName || "",
      type: targetEntity || "",
      relationType: "many-to-one",
      targetEntity: targetEntity || "",
      isNullable,
    });
  }

  // Parse ManyToMany relations
  const manyToManyRegex = /@ManyToMany\(\s*\(\)\s*=>\s*(\w+).*?\)[\s\S]*?(\w+)(?:\?)?:\s*(\w+)(?:\[\])?/g;
  let manyToManyMatch;

  while ((manyToManyMatch = manyToManyRegex.exec(content)) !== null) {
    const targetEntity = manyToManyMatch[1];
    const fieldName = manyToManyMatch[2];
    const isNullable = content.includes(`${fieldName}?:`);

    relations.push({
      fieldName: fieldName || "",
      type: targetEntity || "",
      relationType: "many-to-many",
      targetEntity: targetEntity || "",
      isNullable,
    });
  }

  // Add relation fields to the fields array
  relations.forEach((relation, index) => {
    fields.push({
      name: relation.fieldName,
      type: relation.type,
      isId: false,
      isUnique: false,
      isList: relation.relationType === "one-to-many" || relation.relationType === "many-to-many",
      kind: "object",
      relationName: `${entityName}_${relation.fieldName}`,
      label: `${relation.fieldName} → ${relation.type}`,
      isNullable: relation.isNullable,
    });
  });

  return {
    name: entityName || "",
    fields,
    relations,
  };
}

export const genTypeORMERD = async (schemaPath: string): Promise<ErdResult> => {
  // Get all TypeScript files from the path (file or directory)
  const files = await getTypeScriptFiles(schemaPath);

  if (files.length === 0) {
    throw new Error(`No TypeScript files found at ${schemaPath}`);
  }

  const entities: ParsedEntity[] = [];

  // Parse all entity files
  for (const file of files) {
    try {
      const content = await readFile(file, "utf-8");
      const entity = parseTypeORMEntity(content, file);

      if (entity) {
        entities.push(entity);
      }
    } catch (error) {
      console.warn(`Warning: Could not parse ${file}:`, error);
    }
  }

  if (entities.length === 0) {
    throw new Error("No TypeORM entities found in the provided path");
  }

  // Create nodes
  const nodes: Node[] = entities.map((entity) => ({
    id: entity.name,
    type: "default",
    data: {
      label: entity.name,
      fields: entity.fields,
    },
    position: { x: 0, y: 0 },
    style: {
      width: calcTableWidth(entity.fields),
    },
  }));

  // Create edges
  const edges: Edge[] = [];

  entities.forEach((entity) => {
    entity.relations.forEach((relation) => {
      // Check if target entity exists
      const targetExists = entities.some((e) => e.name === relation.targetEntity);

      if (targetExists) {
        const fieldIndex = entity.fields.findIndex((f) => f.name === relation.fieldName);

        edges.push({
          id: `${entity.name}-${relation.fieldName}-${relation.targetEntity}`,
          source: entity.name,
          sourceHandle: `field-${fieldIndex}`,
          target: relation.targetEntity,
          targetHandle: "table-input",
          label: relation.fieldName,
          type: "smoothstep",
          animated: true,
          data: {
            relationshipType: relation.relationType,
            fromField: relation.fieldName,
            fromTable: entity.name,
            isList: relation.relationType === "one-to-many" || relation.relationType === "many-to-many",
          },
        });
      }
    });
  });

  return { nodes, edges };
};