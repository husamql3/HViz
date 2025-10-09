import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import data from './data.json'
import dagre from 'dagre';
import { useEffect } from 'react';

const nodeTypes = {
  default: (props) => {
    const { data, id } = props;
    const fieldCount = data.fields?.length || 0;

    return (
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        border: '2px solid #3b82f6',
        borderRadius: '8px',
        padding: '12px',
        minWidth: '280px',
        boxShadow: '0 4px 20px rgba(59, 130, 246, 0.2)',
        fontFamily: 'monospace',
      }}>
        <Handle type="target" position={Position.Left} id="table-input" />
        
        <div style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#60a5fa',
          marginBottom: '8px',
          paddingBottom: '8px',
          borderBottom: '1px solid #3b82f6',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {data.label}
        </div>
        
        <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
          {data.fields?.map((field, idx) => (
            <div key={idx} style={{
              padding: '4px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderBottom: idx < fieldCount - 1 ? '1px solid #334155' : 'none',
              paddingBottom: '4px',
              marginBottom: '4px',
              position: 'relative',
            }}>
              {/* Handle for foreign key fields */}
              {field.kind === 'object' && (
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`field-${idx}`}
                  style={{
                    background: '#f59e0b',
                    width: '8px',
                    height: '8px',
                    border: '2px solid #f59e0b',
                  }}
                />
              )}
              
              <span style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: field.isId ? '#10b981' : field.kind === 'object' ? '#f59e0b' : '#6366f1',
              }} />
              
              <span style={{ 
                color: field.isId ? '#10b981' : field.kind === 'object' ? '#f59e0b' : '#e2e8f0', 
                fontWeight: field.isId ? '600' : field.kind === 'object' ? '600' : '400' 
              }}>
                {field.name}
              </span>
              
              <span style={{ color: '#64748b', fontSize: '11px', marginLeft: 'auto' }}>
                {field.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(data.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(data.edges);

  useEffect(() => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'LR', ranksep: 250, nodesep: 200 });

    nodes.forEach(node => {
      dagreGraph.setNode(node.id, { width: 320, height: node.style?.height || 200 });
    });

    edges.forEach(edge => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map(node => {
      const position = dagreGraph.node(node.id);
      return {
        ...node,
        position: { x: position.x - 160, y: position.y - 100 },
      };
    });

    setNodes(layoutedNodes);
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw', background: '#0f172a' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        style={{
          backgroundColor: '#0f172a',
        }}
        fitView
      >
        <Background
          color="#1e293b"
          style={{ backgroundColor: '#0f172a' }}
          gap={16}
          size={1}
        />
        <Controls
          style={{
            display: 'flex',
            gap: '8px',
            left: '20px',
            top: '20px',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid #3b82f6',
            borderRadius: '8px',
            padding: '8px',
          }}
          showInteractive={true}
        />
        <MiniMap
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid #3b82f6',
            borderRadius: '8px',
          }}
          nodeColor="#3b82f6"
          maskColor="rgba(59, 130, 246, 0.2)"
        />
      </ReactFlow>
      <style>{`
        .react-flow__edge-path {
          stroke: #3b82f6 !important;
          stroke-width: 2px !important;
        }
        .react-flow__edge-smoothstep {
          stroke: #3b82f6 !important;
          stroke-width: 2px !important;
        }
        .react-flow__edge-label {
          background: rgba(15, 23, 42, 0.95);
          color: #60a5fa;
          font-size: 12px;
          font-family: monospace;
          padding: 4px 8px;
          border: 1px solid #3b82f6;
          border-radius: 4px;
          font-weight: 500;
        }
        .react-flow__controls {
          display: flex !important;
        }
        .react-flow__controls-button {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid #3b82f6;
          color: #60a5fa;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .react-flow__controls-button:hover {
          background: rgba(59, 130, 246, 0.2);
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
        }
        .react-flow__minimap-canvas {
          background: rgba(15, 23, 42, 0.5) !important;
        }
      `}</style>
    </div>
  )
}

export default App