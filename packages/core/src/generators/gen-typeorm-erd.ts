import { readFile } from "node:fs/promises";

import type { Edge, ErdResult, Node } from "../types/erd.type";
import type { ParsedEntity } from "../types/typeorm.type";
import { calcTableWidth } from "../utils/calc-table-width";
import { getFilesFromDir } from "../utils/get-files-from-dir";
import { parseTypeORMEntity } from "../utils/helpers/typeorm-helpers";

export const genTypeORMERD = async (schemaPath: string): Promise<ErdResult> => {
	const files = await getFilesFromDir([".ts", ".js"], schemaPath);
	if (files.length === 0) {
		throw new Error(`No TypeScript files found at ${schemaPath}`);
	}

	const entities: ParsedEntity[] = [];
	for (const file of files) {
		try {
			const content = await readFile(file, "utf-8");
			const entity = parseTypeORMEntity(content);

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

	const edges: Edge[] = [];

	entities.forEach((entity) => {
		entity.relations.forEach((relation) => {
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
