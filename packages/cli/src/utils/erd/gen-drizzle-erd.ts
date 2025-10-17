import { Parser } from "@dbml/core";
import { mysqlGenerate, pgGenerate, sqliteGenerate } from "drizzle-dbml-generator";
import type { DatabaseType } from "@/types/db.type";
import type { Edge, ErdResult, Node } from "@/types/erd.type";
import { calcTableWidth } from "@/utils/calc-table-width";
import { pluralize, removeIdSuffix, toCamelCase } from "@/utils/helpers/drizzle-helpers";

export const genDrizzleERD = async (schemaModule: string, dbType: DatabaseType): Promise<ErdResult> => {
	let generateFn: (options: { schema: string; relational: boolean }) => string;

	switch (dbType) {
		case "drizzle-postgres":
			generateFn = pgGenerate;
			break;
		case "drizzle-mysql":
			generateFn = mysqlGenerate;
			break;
		case "drizzle-sqlite":
			generateFn = sqliteGenerate;
			break;
		default:
			throw new Error(`Unsupported database type: ${dbType}`);
	}

	// Generate DBML string using drizzle-dbml-generator
	const dbml = generateFn({ schema: schemaModule, relational: true });

	// Parse DBML to Database object using @dbml/core
	const parser = new Parser();
	const database = parser.parse(dbml, "dbml");

	const nodes: Node[] = [];
	const edges: Edge[] = [];

	// Assume single schema for simplicity
	const dbSchema = database.schemas[0];

	// First, create nodes with scalar fields
	dbSchema?.tables.forEach((table) => {
		const fields = table.fields.map((field) => {
			let fieldLabel = field.name;
			if (field.pk) fieldLabel += " (ID)";

			return {
				name: field.name,
				type: field.type.type_name,
				isId: !!field.pk, // Convert to boolean
				isUnique: !!field.unique, // Convert to boolean
				isList: false,
				kind: "scalar" as const,
				relationName: undefined,
				label: fieldLabel,
				isNullable: !field.not_null,
			};
		});

		nodes.push({
			id: table.name,
			type: "default",
			data: {
				label: table.name,
				fields,
			},
			position: { x: 0, y: 0 },
			style: {
				width: calcTableWidth(fields),
			},
		});
	});

	// Now, process refs to add virtual relation fields and edges
	dbSchema?.refs.forEach((ref) => {
		const left = ref?.endpoints[0];
		const right = ref?.endpoints[1];
		const isComposite = left && left.fieldNames.length > 1; // Skip composites for simplicity;
		if (isComposite) return;

		let manyEndpoint: typeof left, oneEndpoint: typeof right, relationshipDir: ">" | "<" | "-";
		if (left?.relation === "*" && right?.relation === "1") {
			manyEndpoint = left;
			oneEndpoint = right;
			relationshipDir = ">";
		} else if (left?.relation === "1" && right?.relation === "*") {
			manyEndpoint = right;
			oneEndpoint = left;
			relationshipDir = "<";
		} else if (left?.relation === "1" && right?.relation === "1") {
			// One-to-one; treat left as "many" (FK side), but no list
			manyEndpoint = left;
			oneEndpoint = right;
			relationshipDir = "-";
		} else {
			return; // Unsupported
		}

		const manyTableName = manyEndpoint.tableName;
		const oneTableName = oneEndpoint.tableName;
		const fkFieldName = manyEndpoint.fieldNames[0];

		// Find nodes
		const manyNode = nodes.find((n) => n.id === manyTableName);
		const oneNode = nodes.find((n) => n.id === oneTableName);
		if (!manyNode || !oneNode) return;

		// Find FK field in many node to get nullability
		const fkField = manyNode.data.fields.find((f) => f.name === fkFieldName);
		if (!fkField) return;

		// Add virtual field to many side (many-to-one)
		const manyVirtualName = toCamelCase(removeIdSuffix(fkFieldName || ""));
		const manyVirtualField = {
			name: manyVirtualName,
			type: oneTableName,
			isId: false,
			isUnique: false,
			isList: false, // false for many-to-one or one-to-one
			kind: "object",
			relationName: ref.name,
			label: `${manyVirtualName} → ${oneTableName}`,
			isNullable: fkField.isNullable,
		};
		manyNode.data.fields.push(manyVirtualField);
		const manyFieldIndex = manyNode.data.fields.length - 1;

		// Update width for many node
		manyNode.style.width = calcTableWidth(manyNode.data.fields);

		// Add edge for many-to-one
		edges.push({
			id: `${manyTableName}-${manyVirtualName}-${oneTableName}`,
			source: manyTableName,
			sourceHandle: `field-${manyFieldIndex}`,
			target: oneTableName,
			targetHandle: `table-input`,
			label: ref.name,
			type: "smoothstep",
			animated: true,
			data: {
				relationshipType: relationshipDir === "-" ? "one-to-one" : "many-to-one",
				fromField: manyVirtualName,
				fromTable: manyTableName,
				isList: manyVirtualField.isList,
			},
		});

		// Add virtual field to one side (one-to-many)
		const oneVirtualName = pluralize(toCamelCase(manyTableName));
		const oneVirtualField = {
			name: oneVirtualName,
			type: manyTableName,
			isId: false,
			isUnique: false,
			isList: relationshipDir !== "-", // true for one-to-many, false for one-to-one
			kind: "object",
			relationName: ref.name,
			label: `${oneVirtualName} → ${manyTableName}`,
			isNullable: true, // Lists are typically "nullable" in Prisma sense
		};
		oneNode.data.fields.push(oneVirtualField);
		const oneFieldIndex = oneNode.data.fields.length - 1;

		// Update width for one node
		oneNode.style.width = calcTableWidth(oneNode.data.fields);

		// Add edge for one-to-many
		edges.push({
			id: `${oneTableName}-${oneVirtualName}-${manyTableName}`,
			source: oneTableName,
			sourceHandle: `field-${oneFieldIndex}`,
			target: manyTableName,
			targetHandle: `table-input`,
			label: ref.name,
			type: "smoothstep",
			animated: true,
			data: {
				relationshipType: relationshipDir === "-" ? "one-to-one" : "one-to-many",
				fromField: oneVirtualName,
				fromTable: oneTableName,
				isList: oneVirtualField.isList,
			},
		});
	});

	return { nodes, edges };
};
