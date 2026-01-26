'use client';

/**
 * Workflow Canvas V2 - Scientific Luxury Edition
 *
 * Visual workflow editor using @xyflow/react (React Flow v12)
 * Implements OLED black background, spectral colours, and physics-based animations.
 *
 * @see docs/DESIGN_SYSTEM.md for styling reference
 */

import { useCallback, useRef, DragEvent } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  NodeTypes,
  BackgroundVariant,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Save, Play, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { SPECTRAL, BACKGROUNDS, EASINGS, DURATIONS } from '@/lib/design-tokens';
import { NODE_SPECTRAL_COLOURS, NodeType } from '@/types/workflow';

// Import custom node components
import { WorkflowNodeComponent } from '../nodes/workflow-node';
import { NodePalette } from '../sidebar/node-palette';

// Define node types mapping
const nodeTypes: NodeTypes = {
  start: WorkflowNodeComponent,
  trigger: WorkflowNodeComponent,
  end: WorkflowNodeComponent,
  output: WorkflowNodeComponent,
  llm: WorkflowNodeComponent,
  agent: WorkflowNodeComponent,
  tool: WorkflowNodeComponent,
  action: WorkflowNodeComponent,
  conditional: WorkflowNodeComponent,
  logic: WorkflowNodeComponent,
  loop: WorkflowNodeComponent,
  knowledge: WorkflowNodeComponent,
  http: WorkflowNodeComponent,
  code: WorkflowNodeComponent,
  verification: WorkflowNodeComponent,
};

interface WorkflowCanvasV2Props {
  workflowId?: string;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => Promise<void>;
  onExecute?: () => Promise<void>;
  readonly?: boolean;
}

function WorkflowCanvasInner({
  initialNodes = [
    {
      id: 'start-1',
      type: 'start',
      position: { x: 250, y: 50 },
      data: { label: 'Start', nodeType: 'start' },
    },
  ],
  initialEdges = [],
  onSave,
  onExecute,
  readonly = false,
}: WorkflowCanvasV2Props) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition, fitView, zoomIn, zoomOut } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => {
      // Add edge with Scientific Luxury styling
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: {
              stroke: 'rgba(255, 255, 255, 0.3)',
              strokeWidth: 1,
            },
            markerEnd: {
              type: 'arrowclosed' as const,
              color: 'rgba(255, 255, 255, 0.5)',
            },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  // Handle drag and drop from palette
  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          label: type.charAt(0).toUpperCase() + type.slice(1),
          nodeType: type,
          status: 'idle',
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  const handleSave = async () => {
    if (onSave) {
      await onSave(nodes, edges);
    }
  };

  const handleExecute = async () => {
    if (onExecute) {
      await onExecute();
    }
  };

  return (
    <div
      ref={reactFlowWrapper}
      className="flex h-full w-full"
      style={{ backgroundColor: BACKGROUNDS.primary }}
    >
      {/* Node Palette Sidebar */}
      {!readonly && <NodePalette />}

      {/* Main Canvas Area */}
      <div className="relative flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={readonly ? undefined : onNodesChange}
          onEdgesChange={readonly ? undefined : onEdgesChange}
          onConnect={readonly ? undefined : onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable={!readonly}
          nodesConnectable={!readonly}
          elementsSelectable={!readonly}
          defaultEdgeOptions={{
            animated: true,
            style: { stroke: 'rgba(255, 255, 255, 0.3)', strokeWidth: 1 },
          }}
          proOptions={{ hideAttribution: true }}
          style={{ backgroundColor: BACKGROUNDS.primary }}
        >
          {/* Scientific Luxury Background - Dots on OLED black */}
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="rgba(255, 255, 255, 0.05)"
          />

          {/* Custom Controls Panel */}
          <Panel position="top-right" className="flex gap-2">
            <motion.div
              className="flex gap-1 rounded-sm border-[0.5px] border-white/[0.06] bg-[#050505]/90 p-1 backdrop-blur-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATIONS.normal, ease: EASINGS.outExpo }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => zoomIn()}
                className="h-8 w-8 text-white/50 hover:bg-white/5 hover:text-white"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => zoomOut()}
                className="h-8 w-8 text-white/50 hover:bg-white/5 hover:text-white"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fitView()}
                className="h-8 w-8 text-white/50 hover:bg-white/5 hover:text-white"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </motion.div>
          </Panel>

          {/* MiniMap with Scientific Luxury colours */}
          <MiniMap
            nodeColor={(node) => {
              const nodeType = node.type as NodeType;
              return NODE_SPECTRAL_COLOURS[nodeType] || SPECTRAL.grey;
            }}
            maskColor="rgba(5, 5, 5, 0.8)"
            style={{
              backgroundColor: BACKGROUNDS.primary,
              border: '0.5px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '2px',
            }}
            className="!border-[0.5px] !border-white/[0.06] !bg-[#050505]"
          />

          {/* Action Panel */}
          {!readonly && (
            <Panel position="bottom-right">
              <motion.div
                className="flex gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DURATIONS.normal, ease: EASINGS.outExpo }}
              >
                {onExecute && (
                  <Button
                    onClick={handleExecute}
                    className="border-[0.5px] border-[#00F5FF]/30 bg-[#00F5FF]/10 text-[#00F5FF] hover:bg-[#00F5FF]/20"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Execute
                  </Button>
                )}
                {onSave && (
                  <Button
                    onClick={handleSave}
                    className="border-[0.5px] border-[#00FF88]/30 bg-[#00FF88]/10 text-[#00FF88] hover:bg-[#00FF88]/20"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                )}
              </motion.div>
            </Panel>
          )}
        </ReactFlow>
      </div>
    </div>
  );
}

// Wrap with ReactFlowProvider for hooks access
export function WorkflowCanvasV2(props: WorkflowCanvasV2Props) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
