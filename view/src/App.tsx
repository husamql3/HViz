import './App.css'
import { ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import data from './data.json'
import dagre from 'dagre';

function App() {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'LR', ranksep: 150, nodesep: 100 });

  data.nodes.forEach(node => {
    dagreGraph.setNode(node.id, { width: 250, height: 150 });
  });

  data.edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = data.nodes.map(node => {
    const position = dagreGraph.node(node.id);
    return { ...node, position: { x: position.x, y: position.y } };
  });
  const layoutedData = {
    nodes: layoutedNodes,
    edges: data.edges
  };
  return (
    <div
      style={{ height: '100vh', width: '100vw' }}
    >
      <ReactFlow
        width={1200}
        height={800}
        nodes={layoutedData.nodes}
        edges={layoutedData.edges}
        fitView
      />
    </div>
  )
}

export default App
