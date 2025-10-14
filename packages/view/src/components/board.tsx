"use client";

import {
	Background,
	BackgroundVariant,
	Controls,
	Handle,
	MiniMap,
	type Node,
	type NodeProps,
	Position,
	ReactFlow,
	useEdgesState,
	useNodesState,
} from "@xyflow/react";
import dagre from "dagre";
import "@xyflow/react/dist/style.css";
import type { Edge, Field } from "@viz/cli/src/types/erd.type";
import { Key, Link } from "lucide-react";
import { useMemo } from "react";
import { BsDiamond, BsDiamondFill } from "react-icons/bs";
import { GoTable } from "react-icons/go";
import { HiOutlineFingerPrint } from "react-icons/hi";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils/cn";
import { INITIAL_EDGES, INITIAL_NODES } from "@/utils/data";

type NodeData = {
	label: string;
	fields: Field[];
};

type NodeType = Node<NodeData>;

const RenderIcon = ({ field }: { field: Field }) => {
	const icons = [];

	if (field.isId) {
		icons.push({
			icon: <Key className="size-4 text-[#B4B4B4]" />,
			tooltip: "Primary Key",
		});
	}

	if (field.kind === "object") {
		icons.push({
			icon: <Link className="size-4 text-[#B4B4B4]" />,
			tooltip: "Foreign Key",
		});
	}

	if (field.isUnique) {
		icons.push({
			icon: <HiOutlineFingerPrint className="size-4 text-[#B4B4B4]" />,
			tooltip: "Unique",
		});
	}

	icons.push({
		icon: field.isNullable ? (
			<BsDiamond className="size-4 text-[#B4B4B4]" />
		) : (
			<BsDiamondFill className="size-4 text-[#B4B4B4]" />
		),
		tooltip: field.isNullable ? "Nullable" : "Required",
	});

	return (
		<TooltipProvider delayDuration={200}>
			<div className="flex items-center justify-start gap-2">
				{icons.map((item, idx) => (
					<Tooltip key={idx}>
						<TooltipTrigger asChild>
							<div className="cursor-help transition-transform hover:scale-110 text-[#B4B4B4]">{item.icon}</div>
						</TooltipTrigger>
						<TooltipContent side="top" className="text-xs">
							{item.tooltip}
						</TooltipContent>
					</Tooltip>
				))}
			</div>
		</TooltipProvider>
	);
};

const nodeTypes = {
	default: (props: NodeProps<NodeType>) => {
		const { data } = props;
		return (
			<div className="font-mono shadow-2xl rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900/95 backdrop-blur-sm">
				{/* handle for target table - fixed ID to match edges */}
				<Handle type="target" position={Position.Left} id="table-input" />

				{/* table */}
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead colSpan={4} className="flex items-center gap-2.5 py-3.5 px-4 font-semibold text-zinc-100">
								<GoTable className="size-5 text-zinc-400" />
								<span className="text-base tracking-tight">{data.label}</span>
							</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{data.fields.map((field, i) => (
							<TableRow
								key={field.name}
								className={cn(
									"border-b border-zinc-800/50 transition-colors hover:bg-zinc-800/40 group",
									field.isId && "bg-amber-500/5",
									field.kind === "object" && "bg-blue-500/5",
								)}
							>
								<TableCell className="py-3 px-4 relative">
									{/* handle for foreign key fields */}
									{field.kind === "object" && <Handle type="source" position={Position.Right} id={`field-${i}`} />}

									{/* render icon and field name */}
									<div className="flex items-center gap-3">
										<RenderIcon field={field} />
										<span
											className={cn(
												"text-sm font-medium transition-colors",
												field.isId ? "text-amber-300" : "text-zinc-300",
												field.kind === "object" && "text-blue-300",
											)}
										>
											{field.name}
										</span>
										{/* render field type */}
										<span className="text-xs ml-auto text-zinc-500 font-mono bg-zinc-800/50 px-2 py-0.5 rounded">
											{field.type}
										</span>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		);
	},
};

export const Board = () => {
	const initialLayoutedNodes = useMemo(() => {
		const dagreGraph = new dagre.graphlib.Graph();
		dagreGraph.setDefaultEdgeLabel(() => ({}));
		dagreGraph.setGraph({ rankdir: "LR", ranksep: 250, nodesep: 200 });

		INITIAL_NODES.forEach((node) => {
			dagreGraph.setNode(node.id, { width: 320, height: 200 });
		});

		INITIAL_EDGES.forEach((edge) => {
			dagreGraph.setEdge(edge.source, edge.target);
		});

		dagre.layout(dagreGraph);

		return INITIAL_NODES.map((node) => {
			const position = dagreGraph.node(node.id);
			return {
				...node,
				position: { x: position.x - 100, y: position.y - 100 },
			};
		});
	}, []); // Empty deps - only run once

	const [nodes, , onNodesChange] = useNodesState<NodeType>(initialLayoutedNodes);
	const [edges, , onEdgesChange] = useEdgesState<Edge>(INITIAL_EDGES);

	return (
		<div className="bg-zinc-950 h-full w-full rounded-md border overflow-hidden border-zinc-900">
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				nodeTypes={nodeTypes}
				colorMode="dark"
				attributionPosition="top-right"
				fitView
				defaultEdgeOptions={{
					labelStyle: { display: "none" },
					animated: true,
					style: {
						strokeWidth: 3,
					},
				}}
			>
				<Background variant={BackgroundVariant.Dots} gap={18} size={3} color="#1F1F1F" />
				<Controls
					style={{
						display: "flex",
						gap: "8px",
						backgroundColor: "rgba(24, 24, 27, 0.95)",
						border: "1px solid #3f3f46",
						borderRadius: "8px",
						padding: "8px",
						backdropFilter: "blur(8px)",
					}}
				/>
				<MiniMap
					className="rounded-lg border border-zinc-700 background-zinc-800 shadow-xl overflow-hidden"
					nodeColor="#52525b"
					maskColor="rgba(24, 24, 27, 0.8)"
				// style={{
				// 	backgroundColor: "rgba(24, 24, 27, 0.95)",
				// }}
				/>
			</ReactFlow>
		</div>
	);
};
