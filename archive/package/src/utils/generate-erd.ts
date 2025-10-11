import { getDMMF } from "@prisma/internals";
import type { ErdResult, Node, Edge } from "../types/erd.type";

const NODE_HEIGHT = 60; // Base height per attribute

export const generateErd = async (schema: string): Promise<ErdResult> => {
  const dmmf = await getDMMF({
    datamodel: schema,
    // prismaPath: "../../prisma/schema.prisma"
  });

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  dmmf.datamodel.models.forEach((model) => {
    // Calculate node height based on number of fields
    const fieldCount = model.fields.length;
    const calculatedHeight = NODE_HEIGHT + fieldCount * 25;

    // Create node with table name and attributes
    const fields = model.fields.map(field => {
      let fieldLabel = field.name;

      // Add type indicator
      if (field.isId) {
        fieldLabel += ` (ID)`;
      } else if (field.kind === 'object') {
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
      };
    });

    nodes.push({
      id: model.name,
      type: 'default',
      data: {
        label: model.name,
        fields,
      },
      position: { x: 0, y: 0 }, // Will be set by dagre layout
      style: {
        width: 280,
        height: calculatedHeight,
      },
    });
  });

  // Create edges for relations
  dmmf.datamodel.models.forEach((model) => {
    model.fields.forEach((field, fieldIndex) => {
      if (field.relationName && field.kind === 'object') {
        // Find the target model
        const targetModel = dmmf.datamodel.models.find(m => m.name === field.type);

        if (targetModel) {
          const relationshipType = field.isList ? 'one-to-many' : 'many-to-one';

          // Create edge from the source field to the target table
          edges.push({
            id: `${model.name}-${field.name}-${field.type}`,
            source: model.name,
            sourceHandle: `field-${fieldIndex}`, // Connect from specific field
            target: field.type,
            targetHandle: `table-input`, // Connect to the table itself
            label: field.relationName,
            type: 'smoothstep',
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
}