export type Field = {
	name: string;
	type: string;
	isId: boolean;
	isUnique: boolean;
	isList: boolean;
	kind: string;
	relationName?: string;
	label: string;
	isNullable: boolean;
};

export type NodeData = {
	label: string;
	fields: Field[];
};

export type Node = {
	id: string;
	type: string;
	data: NodeData;
	position: { x: number; y: number };
	style: {
		width: number;
	};
};

export type EdgeData = {
	relationshipType: string;
	fromField: string;
	fromTable: string;
	isList: boolean;
};

export type Edge = {
	id: string;
	source: string;
	sourceHandle: string;
	target: string;
	targetHandle: string;
	label?: string;
	type: string;
	animated: boolean;
	data: EdgeData;
};

export type ErdResult = {
	nodes: Node[];
	edges: Edge[];
};
