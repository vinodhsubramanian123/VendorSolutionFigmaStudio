import React, {  useCallback,  useEffect } from 'react';
import { 
  ReactFlow, 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Connection,
  Edge,
  Node,
  Handle,
  Position,
  ReactFlowProvider,
  useReactFlow,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AlertTriangle,  Box, Server} from 'lucide-react';
import dagre from 'dagre';
import { GraphNode, GraphEdge, GraphPath } from '../../types';
import { ErrorBoundary } from '../shared/ErrorBoundary';
// ==========================================
// CUSTOM NODE COMPONENTS (Cosmic Slate Theme)
// ==========================================
const CatalogPartNode = ({ data }: { data: GraphNode }) => {
  return (
    <div className={`bg-surface-card border-2 ${data.data?.isPathActive ? 'border-status-success shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'border-brand-indigo/50 shadow-lg'} rounded-xl p-3 min-w-[200px] hover:border-brand-indigo hover:shadow-indigo-500/20 transition-all cursor-pointer`}>
      <Handle type="target" position={Position.Top} className={`w-3 h-3 ${data.data?.isPathActive ? 'bg-status-success' : 'bg-brand-indigo'} border-2 border-black`} />
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
        <Server className={`w-4 h-4 ${data.data?.isPathActive ? 'text-status-success' : 'text-brand-indigo'}`} />
        <span className={`text-[10px] font-bold font-mono ${data.data?.isPathActive ? 'text-emerald-300' : 'text-indigo-300'} uppercase tracking-widest`}>Catalog Part</span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-content-primary">{data.label}</span>
        {data.data?.partNumber && <div className="text-[9px] text-content-muted font-mono mt-1">PN: {data.data.partNumber}</div>}
        {data.data?.price && <div className="text-[10px] text-status-success font-bold mt-1">${data.data.price.toLocaleString()}</div>}
      </div>
      <Handle type="source" position={Position.Bottom} className={`w-3 h-3 ${data.data?.isPathActive ? 'bg-status-success' : 'bg-brand-indigo'} border-2 border-black`} />
    </div>
  );
};
const ScrapedOrphanNode = ({ data }: { data: GraphNode }) => {
  return (
    <div className="bg-surface-canvas border-2 border-status-warning/80 rounded-xl p-3 shadow-[0_0_15px_rgba(245,158,11,0.2)] min-w-[200px] hover:border-status-warning transition-all cursor-pointer">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-status-warning border-2 border-black" />
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-status-warning/20">
        <AlertTriangle className="w-4 h-4 text-status-warning animate-pulse" />
        <span className="text-[10px] font-bold font-mono text-status-warning uppercase tracking-widest">Scraped Orphan</span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-content-primary line-clamp-2">{data.label}</span>
        {data.data?.confidenceScore !== undefined && (
          <div className="text-[9px] text-status-warning mt-2 font-mono flex items-center justify-between border-t border-white/10 pt-1">
            <span>Confidence</span>
            <span>{Math.round(data.data.confidenceScore * 100)}%</span>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-status-warning border-2 border-black" />
    </div>
  );
};
const CategoryHubNode = ({ data }: { data: GraphNode }) => {
  return (
    <div className={`bg-surface-elevated border-2 ${data.data?.isPathActive ? 'border-status-success/80 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-content-muted shadow-xl'} rounded-lg p-3 min-w-[150px] hover:border-content-secondary transition-all cursor-pointer`}>
      <Handle type="target" position={Position.Top} className={`w-3 h-3 ${data.data?.isPathActive ? 'bg-status-success' : 'bg-content-muted'} border-2 border-black`} />
      <div className="flex items-center justify-center gap-2">
        <Box className={`w-4 h-4 ${data.data?.isPathActive ? 'text-status-success' : 'text-content-secondary'}`} />
        <span className="text-sm font-bold text-content-primary">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className={`w-3 h-3 ${data.data?.isPathActive ? 'bg-status-success' : 'bg-content-muted'} border-2 border-black`} />
    </div>
  );
};
const nodeTypes = {
  catalog_part: CatalogPartNode,
  scraped_orphan: ScrapedOrphanNode,
  category_hub: CategoryHubNode,
  // Fallbacks for legacy schema types
  product: CatalogPartNode,
  subproduct: CatalogPartNode,
  category: CategoryHubNode,
  subcategory: CategoryHubNode,
  sku: CatalogPartNode
};
// ==========================================
// GRAPH CANVAS ENGINE
// ==========================================
// Dagre Layout Generator
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  const nodeWidth = 220;
  const nodeHeight = 100;
  dagreGraph.setGraph({ rankdir: direction, nodesep: 80, ranksep: 120 });
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });
  dagre.layout(dagreGraph);
  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });
  return { nodes: newNodes, edges };
};
export interface KnowledgeGraphCanvasProps {
  apiNodes: GraphNode[];
  apiEdges: GraphEdge[];
  apiPaths?: GraphPath[];
  activeSelectedPathId?: string | null;
  onNodeClick?: (id: string) => void;
  onEdgeClick?: (id: string) => void;
  onGraphChange?: (nodes: GraphNode[], edges: GraphEdge[]) => void;
  onNodeDrop?: (orphanId: string, orphanName: string, targetNodeId: string) => void;
}
function KnowledgeGraphCanvasInner({ apiNodes, apiEdges, apiPaths = [], activeSelectedPathId, onNodeClick, onEdgeClick, onGraphChange, onNodeDrop }: KnowledgeGraphCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const reactFlowInstance = useReactFlow();
  // Hydrate from API
  useEffect(() => {
    if (!apiNodes || !apiEdges) return;
    // Convert API nodes to React Flow nodes
    const flowNodes: Node[] = apiNodes.map((n) => {
      let isPathActive = false;
      if (activeSelectedPathId && apiPaths.length > 0) {
        const activePath = apiPaths.find(p => p.pathId === activeSelectedPathId);
        if (activePath && activePath.nodesInvolved.includes(n.id)) {
          isPathActive = true;
        }
      }
      
      return {
        id: n.id,
        type: n.type || 'catalog_part',
        data: {
          label: n.label,
          sublabel: n.sublabel,
          partNumber: n.data?.partNumber,
          price: n.data?.price,
          confidenceScore: n.data?.confidenceScore,
          status: n.status,
          isPathActive
        },
        position: { x: 0, y: 0 } // Computed by Dagre
      };
    });
    const flowEdges: Edge[] = apiEdges.map((e) => {
      let isPathActive = false;
      if (activeSelectedPathId && apiPaths.length > 0) {
        const activePath = apiPaths.find(p => p.pathId === activeSelectedPathId);
        if (activePath && activePath.edgesInvolved.includes(e.id)) {
          isPathActive = true;
        }
      }
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'default',
        animated: isPathActive ? true : e.isAnimated || false,
        label: e.relationship,
        style: { 
          stroke: isPathActive ? '#00d4a0' : (e.isAnimated ? '#ff9b36' : '#4a85fd'), 
          strokeWidth: isPathActive ? 4 : (e.weight && e.weight > 1 ? 3 : 1) 
        },
        labelStyle: { fill: '#8b949e', fontSize: 10, fontWeight: 700 },
        labelBgStyle: { fill: '#03050a', fillOpacity: 0.8 }
      };
    });
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(flowNodes, flowEdges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [apiNodes, apiEdges, apiPaths, activeSelectedPathId, setNodes, setEdges]);
  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, animated: true, type: 'default' }, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      try {
        const rawData = event.dataTransfer.getData('text/plain');
        if (!rawData) return;
        const data = JSON.parse(rawData);
        
        if (data.type === 'orphan' && data.id && onNodeDrop) {
          const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          });
          
          const intersectingNode = reactFlowInstance.getIntersectingNodes({
            x: position.x,
            y: position.y,
            width: 1,
            height: 1
          })[0];

          if (intersectingNode) {
            onNodeDrop(data.id, data.name, intersectingNode.id);
          }
        }
      } catch (e) {
        // Non-JSON drag data (e.g. OS file drops) — not an error condition
        console.debug('[KnowledgeGraphCanvas] Ignored non-JSON drag payload:', e);
      }
    },
    [reactFlowInstance, onNodeDrop]
  );

  const dragProps = {
    onDragOver,
    onDrop
  };

  return (
    <ErrorBoundary>
      <div className="w-full h-full min-h-[600px] bg-[#03050a] border border-white/5 rounded-xl overflow-hidden relative" {...dragProps}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => onNodeClick?.(node.id)}
          onEdgeClick={(_, edge) => onEdgeClick?.(edge.id)}
          nodeTypes={nodeTypes}
          fitView
          className="bg-[#03050a]"
        >
          <Background color="rgba(255, 255, 255, 0.05)" variant={BackgroundVariant.Dots} gap={24} size={1} />
          <Controls className="bg-surface-elevated border-white/10 fill-white" />
          <MiniMap 
            nodeColor={(n) => {
              if (n.type === 'scraped_orphan') return '#f59e0b';
              if (n.type === 'category_hub') return '#4b5563';
              return '#4a85fd';
            }}
            maskColor="rgba(0, 0, 0, 0.7)"
            className="bg-surface-canvas border border-white/10 rounded-lg overflow-hidden shadow-2xl" 
          />
        </ReactFlow>
        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 bg-surface-canvas/80 backdrop-blur border border-white/10 rounded-lg p-3 pointer-events-none">
          <span className="text-[10px] font-mono text-content-secondary font-bold uppercase block mb-2">Graph Legend</span>
          <div className="space-y-1.5 text-[11px] text-content-secondary">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-brand-indigo" /> Catalog Verified</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-status-warning animate-pulse" /> Scraped Orphan (Needs Map)</div>
            <div className="flex items-center gap-2"><div className="w-4 h-0.5 bg-brand-indigo" /> Required Dependency</div>
            <div className="flex items-center gap-2"><div className="w-4 h-0.5 bg-crimson-500 bg-[#ff3d5a]" /> Conflict / Blocker</div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export function KnowledgeGraphCanvas(props: KnowledgeGraphCanvasProps) {
  return (
    <ReactFlowProvider>
      <KnowledgeGraphCanvasInner {...props} />
    </ReactFlowProvider>
  );
}