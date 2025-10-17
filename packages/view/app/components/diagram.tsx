// "use client"

// import { useEffect } from "react"
// import {
//   ReactFlow,
//   Background,
//   Controls,
//   MiniMap,
//   useNodesState,
//   useEdgesState,
//   Handle,
//   Position,
//   type Node,
//   type Edge,
//   type NodeProps,
// } from "@xyflow/react"
// import "@xyflow/react/dist/style.css"
// import { Database, Key, Link } from "lucide-react"

// import dagre from "dagre"
// import * as dataModule from "../data.json"
// import { api } from "@/lib/api"

// const data = dataModule as { nodes: TableNode[]; edges: Edge[] }

// interface Field {
//   name: string;
//   type: string;
//   isId: boolean;
//   isUnique: boolean;
//   isList: boolean;
//   kind: string;
//   relationName?: string;
//   label: string;
// }

// interface NodeData {
//   label: string;
//   fields: Field[];
// }

// type TableNode = Node<NodeData>;

// const nodeTypes = {
//   default: (props: NodeProps<NodeData>) => {
//     const { data } = props;
//     const fieldCount = data.fields.length

//     return (
//       <div
//         style={{
//           background: "linear-gradient(135deg, #27272a 0%, #18181b 100%)",
//           border: "2px solid #52525b",
//           borderRadius: "8px",
//           padding: "12px",
//           minWidth: "380px",
//           boxShadow: "0 4px 20px rgba(82, 82, 91, 0.3)",
//           fontFamily: "monospace",
//         }}
//       >
//         <Handle type="target" position={Position.Left} id="table-input" />

//         <div
//           style={{
//             fontSize: "14px",
//             fontWeight: "bold",
//             color: "#a1a1aa",
//             marginBottom: "8px",
//             paddingBottom: "8px",
//             borderBottom: "1px solid #52525b",
//             textTransform: "uppercase",
//             letterSpacing: "0.5px",
//             display: "flex",
//             alignItems: "center",
//             gap: "8px",
//           }}
//         >
//           <Database size={16} style={{ color: "#71717a" }} />
//           {data.label}
//         </div>

//         <div style={{ fontSize: "12px", color: "#d4d4d8" }}>
//           {data.fields.map((field, idx) => (
//             <div
//               key={idx}
//               style={{
//                 padding: "4px 0",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "6px",
//                 borderBottom: idx < fieldCount - 1 ? "1px solid #3f3f46" : "none",
//                 paddingBottom: "4px",
//                 marginBottom: "4px",
//                 position: "relative",
//               }}
//             >
//               {/* Handle for foreign key fields */}
//               {field.kind === "object" && (
//                 <Handle
//                   type="source"
//                   position={Position.Right}
//                   id={`field-${idx}`}
//                   style={{
//                     background: "#a1a1aa",
//                     width: "8px",
//                     height: "8px",
//                     border: "2px solid #a1a1aa",
//                   }}
//                 />
//               )}

//               {field.isId ? (
//                 <Key size={14} style={{ color: "#71717a", flexShrink: 0 }} />
//               ) : field.kind === "object" ? (
//                 <Link size={14} style={{ color: "#a1a1aa", flexShrink: 0 }} />
//               ) : (
//                 <span
//                   style={{
//                     display: "inline-block",
//                     width: "6px",
//                     height: "6px",
//                     borderRadius: "50%",
//                     background: "#71717a",
//                     flexShrink: 0,
//                   }}
//                 />
//               )}

//               <span
//                 style={{
//                   color: field.isId ? "#e4e4e7" : field.kind === "object" ? "#d4d4d8" : "#e4e4e7",
//                   fontWeight: field.isId ? "600" : field.kind === "object" ? "600" : "400",
//                 }}
//               >
//                 {field.name}
//               </span>

//               <span style={{ color: "#71717a", fontSize: "11px", marginLeft: "auto" }}>{field.type}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     )
//   },
// }

// export const Diagram = () => {
//   useEffect(() => {
//     const fetchData = async () => {
//       const res = await api.api.data.$get()
//       const data = await res.json()
//       setNodes(data.nodes)
//       console.log(data)
//     }
//     fetchData()
//   }, [])

//   const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>(data.nodes)
//   const [edges, , onEdgesChange] = useEdgesState<Edge>(data.edges)

//   useEffect(() => {
//     const dagreGraph = new dagre.graphlib.Graph()
//     dagreGraph.setDefaultEdgeLabel(() => ({}))
//     dagreGraph.setGraph({ rankdir: "LR", ranksep: 250, nodesep: 200 })

//     nodes.forEach((node) => {
//       dagreGraph.setNode(node.id, { width: 320, height: node.style?.height || 200 })
//     })

//     edges.forEach((edge) => {
//       dagreGraph.setEdge(edge.source, edge.target)
//     })

//     dagre.layout(dagreGraph)

//     const layoutedNodes = nodes.map((node) => {
//       const position = dagreGraph.node(node.id)
//       return {
//         ...node,
//         position: { x: position.x - 160, y: position.y - 100 },
//       }
//     })

//     setNodes(layoutedNodes)
//   }, [])

//   return (
//     <div className="h-full w-full flex-1 px-4 pb-4">
//       <div className="h-full w-full border text-zinc-700 border-zinc-800 rounded-lg overflow-hidden">
//         <ReactFlow
//           nodes={nodes}
//           edges={edges}
//           onNodesChange={onNodesChange}
//           onEdgesChange={onEdgesChange}
//           nodeTypes={nodeTypes}
//           fitView
//         >
//           <Background color="#3f3f46" style={{ backgroundColor: "#18181b" }} gap={16} size={1} />
//           <Controls
//             style={{
//               display: "flex",
//               gap: "8px",
//               backgroundColor: "rgba(24, 24, 27, 0.9)",
//               border: "1px solid #52525b",
//               borderRadius: "8px",
//               padding: "8px",
//             }}
//             showInteractive={true}
//           />
//           <MiniMap
//             style={{
//               borderRadius: "8px",
//             }}
//             nodeColor="#52525b"
//             maskColor="rgba(82, 82, 91, 0.2)"
//           />
//         </ReactFlow>
//         {/* <style>{`
//         .react-flow__edge-path {
//           stroke: #71717a !important;
//           stroke-width: 2px !important;
//         }
//         .react-flow__edge-smoothstep {
//           stroke: #71717a !important;
//           stroke-width: 2px !important;
//         }
//         .react-flow__edge-label {
//           background: rgba(24, 24, 27, 0.95);
//           color: #a1a1aa;
//           font-size: 12px;
//           font-family: monospace;
//           padding: 4px 8px;
//           border: 1px solid #52525b;
//           border-radius: 4px;
//           font-weight: 500;
//         }
//         .react-flow__controls {
//           display: flex !important;
//         }
//         .react-flow__controls-button {
//           background: rgba(82, 82, 91, 0.1);
//           border: 1px solid #52525b;
//           color: #a1a1aa;
//           border-radius: 6px;
//           cursor: pointer;
//           transition: all 0.2s;
//         }
//         .react-flow__controls-button:hover {
//           background: rgba(82, 82, 91, 0.2);
//           box-shadow: 0 0 10px rgba(82,  82, 91, 0.3);
//         }
//         .react-flow__minimap-canvas {
//           background: rgba(24, 24, 27, 0.5) !important;
//         }
//       `}</style> */}
//       </div>
//     </div>
//   )
// }
