import { getDMMF } from "@prisma/internals";
import type { Edge, ErdResult, Node } from "@/types/erd.type";
import { calcTableWidth } from "@/utils/calc-table-width";

export const genPrismaERD = async (schema: string): Promise<ErdResult> => {
	const dmmf = await getDMMF({
		datamodel: schema,
	});

	const nodes: Node[] = [];
	const edges: Edge[] = [];

	dmmf.datamodel.models.forEach((model) => {
		// Create node with table ame and attributes
		const fields = model.fields.map((field) => {
			let fieldLabel = field.name;

			// Add type indicator
			if (field.isId) {
				fieldLabel += ` (ID)`;
			} else if (field.kind === "object") {
				fieldLabel += ` → ${field.type}`;
			}

			return {
				name: field.name,
				type: field.type,
				isId: field.isId,
				isUnique: field.isUnique,
				isList: field.isList,
				kind: field.kind,
				relationName: field.relationName,
				label: fieldLabel,
				isNullable: field.isRequired !== undefined ? !field.isRequired : true,
			};
		});

		nodes.push({
			id: model.name,
			type: "default",
			data: {
				label: model.name,
				fields,
			},
			position: { x: 0, y: 0 }, // Will be set by dagre layout
			style: {
				width: calcTableWidth(fields),
			},
		});
	});

	// Create edges for relations
	dmmf.datamodel.models.forEach((model) => {
		model.fields.forEach((field, fieldIndex) => {
			if (field.relationName && field.kind === "object") {
				// Find the target model
				const targetModel = dmmf.datamodel.models.find((m) => m.name === field.type);

				if (targetModel) {
					// Determine relationship type
					let relationshipType: "one-to-one" | "one-to-many" | "many-to-one";

					if (field.isList) {
						relationshipType = "one-to-many";
					} else {
						// Check if this is a one-to-one relationship
						// A relation is one-to-one if the foreign key field is unique
						const isOneToOne =
							field.relationFromFields &&
							field.relationFromFields.length > 0 &&
							model.fields.some((f) => field.relationFromFields?.includes(f.name) && (f.isUnique || f.isId));

						relationshipType = isOneToOne ? "one-to-one" : "many-to-one";
					}

					// Create edge from the source field to the target table
					edges.push({
						id: `${model.name}-${field.name}-${field.type}`,
						source: model.name,
						sourceHandle: `field-${fieldIndex}`, // Connect from specific field
						target: field.type,
						targetHandle: `table-input`, // Connect to the table itself
						label: field.relationName,
						type: "smoothstep",
						animated: true,
						data: {
							relationshipType,
							fromField: field.name,
							fromTable: model.name,
							isList: field.isList,
						},
					});
				}
			}
		});
	});

	return { nodes, edges };
};
