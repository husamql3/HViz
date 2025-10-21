import type { Field } from "../../types/erd.type";
import type { ParsedEntity, ParsedRelation } from "../../types/typeorm.type";

export const parseTypeORMEntity = (content: string): ParsedEntity | null => {
  if (!content.includes("@Entity")) {
    return null;
  }

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