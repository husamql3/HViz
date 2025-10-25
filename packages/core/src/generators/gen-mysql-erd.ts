import { readFile } from "node:fs/promises";
import type { Edge, ErdResult, Field, Node } from "../types/erd.type";
import { calcTableWidth } from "../utils/calc-table-width";
import { Parser } from "node-sql-parser/build/mysql";
import { getFilesFromDir } from "../utils/get-files-from-dir";


export const genMySQLERD = async (schemaPath: string): Promise<ErdResult> => {
  
  const files = await getFilesFromDir([".sql"], schemaPath)

  if (files.length === 0) {
    throw new Error(`No SQL schema files found at ${schemaPath}`);
  }

  const schemaContents = await Promise.all(files.map((file) => readFile(file, "utf-8")));

  const schemaContent = schemaContents.join("\n");

  const parser = new Parser();
  const parsedSchema = parser.astify(schemaContent, { database: "MySQL" });

  // For debugging purposes
  // writeFile("parsedSchema.json", JSON.stringify(parsedSchema,null,2), ()=>{});

  if (!Array.isArray(parsedSchema) || parsedSchema.length === 0) {
    throw new Error("No tables found in the schema");
  }

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const relationshipMap = new Map<string, Array<{ targetTable: string; targetColumn: string; fieldIndex: number }>>();

  // First pass: Create nodes with all scalar fields
  parsedSchema.forEach((ast) => {

    let fields: Field[] = [];
    let fieldIndex = 0;

    if (ast.type !== "create" || ast.create_definitions == null || ast.keyword !== 'table' || ast.table === null) return;

    let tableName = "";

    if(Array.isArray(ast.table))
    {
      tableName = ast.table[0]?.table ?? "";
    }else {
      tableName = ast.table?.table ?? "";
    }
    // Process each column
    ast.create_definitions.forEach((definition, idx) => {

      if (definition.resource === "column") 
      {
        if (definition.column.type !== 'column_ref') return;
        const newdefinition = definition as typeof definition & { primary_key?: "primary key" | "key"};
        let IsID = newdefinition.primary_key === "primary key";
        let IsUnique = definition.unique === 'unique';
        ast.create_definitions?.forEach((def) => {
          if(def.resource === 'constraint' && def.constraint_type === 'primary key')
          {
            def.definition.forEach(column => {
              if(column.type !== 'column_ref' || definition.column.type !== 'column_ref') return;
              if(column.column === definition.column.column)
              {
                IsID = true;
              }
            });
          }
          else if (def.resource === 'constraint' && (def.constraint_type === 'unique' || def.constraint_type === 'unique index'))
          {
            def.definition.forEach(column => {
              if(column.type !== 'column_ref' || definition.column.type !== 'column_ref') return;
              if(column.column === definition.column.column)
              {
                IsUnique = true;
              }
            });
          }
        });

        let fieldLabel = definition.column.column as string;

        // Determine type with additional info
        let typeDisplay = definition.definition.dataType.toUpperCase();
        if (definition.definition.length) {
          typeDisplay += `(${definition.definition.length})`;
        }

        fields.push({
          name: definition.column.column as string,
          type: typeDisplay,
          isId: IsID,
          isUnique: IsUnique,
          isList: false,
          kind: "scalar",
          label: fieldLabel,
          isNullable: definition.nullable?.type === 'null'
        });

        fieldIndex++;
      }
      else if(definition.resource === "constraint" && definition.constraint_type === 'FOREIGN KEY')
      {
        if(definition.definition[0]?.type !== 'column_ref' ) return;
        let sourceTable = tableName;
        let TargetTable = definition.reference_definition?.table[0].table as string;
        let sourceColumn = definition.definition[0]?.column as string;
        let sourceHandleIndex = 0;
        let label = `${sourceTable}To${TargetTable}`;
        let EdgeID = `${sourceTable}-${sourceColumn}-to-${TargetTable}`;
        fields.forEach((field, idx) => {
          if(field.label === sourceColumn)
          {
            sourceHandleIndex = idx;
            if(fields[idx])
            {
              fields[idx].relationName = label;
              fields[idx].kind = "object";
            }
          }
        });

        edges.push({
          id: EdgeID,
          source: sourceTable,
          target: TargetTable,
          sourceHandle: "field-" + sourceHandleIndex,
          targetHandle: "table-input",
          label: label,
          type: "smoothstep",
          animated: true,
          data: {
            relationshipType: "many-to-one",
            fromField: sourceColumn,
            fromTable: sourceTable,
            isList: false
          }
        });
      }
    });

    // Create node
    nodes.push({
      id: tableName,
      type: "default",
      data: {
        label: tableName,
        fields,
      },
      position: { x: 0, y: 0 },
      style: {
        width: calcTableWidth(fields),
      },
    });
  });

  return { nodes, edges };
};

/**
 * Helper function to pluralize table names for relationship fields
 */
function pluralize(str: string): string {
  if (str.endsWith("s")) return str;

  if (str.endsWith("y")) {
    const beforeY = str[str.length - 2];
    if (beforeY && ["a", "e", "i", "o", "u"].includes(beforeY.toLowerCase())) {
      return `${str}s`;
    }
    return `${str.slice(0, -1)}ies`;
  }

  return `${str}s`;
}