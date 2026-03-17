import { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { CATEGORIES, CATEGORY_MAP } from '../data/categories';
import { computeRubric } from '../utils/rubricScoring';
import { X, ArrowRight, Link2, Layers, BarChart3, AlertTriangle } from 'lucide-react';
import type { CategoryId } from '../types';

// Expected pipeline progression: each consecutive pair of categories
const EXPECTED_FLOW: [CategoryId, CategoryId][] = [
  ['problem-framing', 'data-sources'],
  ['data-sources', 'preprocessing'],
  ['preprocessing', 'modeling'],
  ['modeling', 'training-optimization'],
  ['training-optimization', 'evaluation'],
  ['evaluation', 'output-deployment'],
  ['output-deployment', 'risks-constraints'],
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface CategoryFlow {
  from: CategoryId;
  to: CategoryId;
  count: number;
  blockPairs: { source: string; target: string }[];
}

// ─── Layout constants ────────────────────────────────────────────────────────

const NODE_R = 24;
const DESKTOP_W = 720;
const DESKTOP_H = 340;
const MOBILE_W = 300;
const MOBILE_H = 680;

function desktopPos(row: number, col: number) {
  const x = 60 + (col - 1) * 200;
  const y = 70 + (row - 1) * 180;
  return { x, y };
}

function mobilePos(step: number) {
  const x = MOBILE_W / 2;
  const y = 50 + (step - 1) * 78;
  return { x, y };
}

// ─── Bézier path between two nodes ──────────────────────────────────────────

function edgePath(
  x1: number, y1: number, x2: number, y2: number, isSelf: boolean,
): string {
  if (isSelf) {
    // Self-loop arc
    return `M ${x1 + NODE_R} ${y1 - 8} C ${x1 + NODE_R + 40} ${y1 - 50}, ${x1 + NODE_R + 40} ${y1 + 50}, ${x1 + NODE_R} ${y1 + 8}`;
  }
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  // Shorten to avoid overlapping the node circles
  const ratio1 = NODE_R / dist;
  const ratio2 = NODE_R / dist;
  const sx = x1 + dx * ratio1;
  const sy = y1 + dy * ratio1;
  const ex = x2 - dx * ratio2;
  const ey = y2 - dy * ratio2;

  const absDx = Math.abs(ex - sx);
  const absDy = Math.abs(ey - sy);

  if (absDy > absDx * 1.5) {
    // Mostly vertical
    const cp = Math.max(absDy * 0.35, 30);
    const dirY = ey > sy ? 1 : -1;
    return `M ${sx} ${sy} C ${sx} ${sy + cp * dirY}, ${ex} ${ey - cp * dirY}, ${ex} ${ey}`;
  }
  // Mostly horizontal
  const cp = Math.max(absDx * 0.4, 30);
  const dirX = ex > sx ? 1 : -1;
  return `M ${sx} ${sy} C ${sx + cp * dirX} ${sy}, ${ex - cp * dirX} ${ey}, ${ex} ${ey}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function FlowDiagramModal() {
  const { state, dispatch } = useProject();
  const [hoveredNode, setHoveredNode] = useState<CategoryId | null>(null);
  const [selectedNode, setSelectedNode] = useState<CategoryId | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);

  if (!state.ui.showFlowDiagram) return null;

  const close = () =>
    dispatch({ type: 'TOGGLE_UI', key: 'showFlowDiagram', value: false });

  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 modal-backdrop"
      onClick={close}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <FlowDiagramContent
          hoveredNode={hoveredNode}
          setHoveredNode={setHoveredNode}
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
          hoveredEdge={hoveredEdge}
          setHoveredEdge={setHoveredEdge}
          onClose={close}
        />
      </div>
    </div>
  );
}

function FlowDiagramContent({
  hoveredNode,
  setHoveredNode,
  selectedNode,
  setSelectedNode,
  hoveredEdge,
  setHoveredEdge,
  onClose,
}: {
  hoveredNode: CategoryId | null;
  setHoveredNode: (id: CategoryId | null) => void;
  selectedNode: CategoryId | null;
  setSelectedNode: (id: CategoryId | null) => void;
  hoveredEdge: string | null;
  setHoveredEdge: (id: string | null) => void;
  onClose: () => void;
}) {
  const { state } = useProject();
  const { project } = state;

  // ── Aggregate connection data ────────────────────────────────────────────
  const { flows, totalConns, crossCatConns, categoryBlockCounts, connectedCategories } =
    useMemo(() => {
      const flowMap = new Map<string, CategoryFlow>();
      let cross = 0;

      for (const conn of project.connections) {
        const src = project.blocks.find((b) => b.id === conn.sourceBlockId);
        const tgt = project.blocks.find((b) => b.id === conn.targetBlockId);
        if (!src || !tgt) continue;

        const key = `${src.category}→${tgt.category}`;
        const existing = flowMap.get(key);
        if (existing) {
          existing.count++;
          existing.blockPairs.push({ source: src.label, target: tgt.label });
        } else {
          flowMap.set(key, {
            from: src.category,
            to: tgt.category,
            count: 1,
            blockPairs: [{ source: src.label, target: tgt.label }],
          });
        }
        if (src.category !== tgt.category) cross++;
      }

      const catCounts = new Map<CategoryId, number>();
      const connected = new Set<CategoryId>();
      for (const b of project.blocks) {
        catCounts.set(b.category, (catCounts.get(b.category) || 0) + 1);
      }
      for (const conn of project.connections) {
        const src = project.blocks.find((b) => b.id === conn.sourceBlockId);
        const tgt = project.blocks.find((b) => b.id === conn.targetBlockId);
        if (src) connected.add(src.category);
        if (tgt) connected.add(tgt.category);
      }

      return {
        flows: Array.from(flowMap.values()),
        totalConns: project.connections.length,
        crossCatConns: cross,
        categoryBlockCounts: catCounts,
        connectedCategories: connected,
      };
    }, [project]);

  const rubric = useMemo(() => computeRubric(project), [project]);
  const coherenceDim = rubric.dimensions.find((d) => d.id === 'coherence');

  // Active filter
  const activeNode = selectedNode ?? hoveredNode;

  const isEdgeVisible = (flow: CategoryFlow) => {
    if (!activeNode) return true;
    return flow.from === activeNode || flow.to === activeNode;
  };

  const isNodeActive = (catId: CategoryId) => {
    if (!activeNode) return true;
    if (catId === activeNode) return true;
    return flows.some(
      (f) =>
        isEdgeVisible(f) && (f.from === catId || f.to === catId),
    );
  };

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link2 size={14} className="text-slate-400" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Pipeline Flow
              </span>
            </div>
            <h2 className="text-lg font-bold">Category-Level Flow Diagram</h2>
            <p className="text-[11px] text-slate-400/80 mt-1 leading-relaxed">
              A high-level view of how your pipeline categories connect. Edge
              thickness shows connection density between stages.
            </p>
            <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Link2 size={10} />
                {totalConns} connection{totalConns !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1">
                <ArrowRight size={10} />
                {crossCatConns} cross-stage
              </span>
              <span className="flex items-center gap-1">
                <Layers size={10} />
                {project.blocks.length} block{project.blocks.length !== 1 ? 's' : ''}
              </span>
              {coherenceDim && (
                <span className="flex items-center gap-1">
                  <BarChart3 size={10} />
                  Coherence: {coherenceDim.score}/{coherenceDim.maxScore}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 ml-4 shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Diagram area */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-50/50">
        {project.blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Layers size={32} className="mb-2 text-slate-300" />
            <p className="text-sm font-medium">No blocks yet</p>
            <p className="text-xs mt-1">
              Add blocks to your pipeline to see the flow diagram
            </p>
          </div>
        ) : (
          <>
            {/* Desktop SVG (hidden on small) */}
            <svg
              viewBox={`0 0 ${DESKTOP_W} ${DESKTOP_H}`}
              className="w-full hidden sm:block"
              style={{ maxHeight: '420px' }}
            >
              <GhostEdges
                flows={flows}
                positionFn={(row, col) => desktopPos(row, col)}
              />
              <DiagramEdges
                flows={flows}
                activeNode={activeNode}
                hoveredEdge={hoveredEdge}
                setHoveredEdge={setHoveredEdge}
                isEdgeVisible={isEdgeVisible}
                positionFn={(row, col) => desktopPos(row, col)}
              />
              <DiagramNodes
                categoryBlockCounts={categoryBlockCounts}
                connectedCategories={connectedCategories}
                activeNode={activeNode}
                isNodeActive={isNodeActive}
                hoveredNode={hoveredNode}
                setHoveredNode={setHoveredNode}
                selectedNode={selectedNode}
                setSelectedNode={setSelectedNode}
                positionFn={(row, col) => desktopPos(row, col)}
                labelBelow
              />
            </svg>

            {/* Mobile SVG (single column) */}
            <svg
              viewBox={`0 0 ${MOBILE_W} ${MOBILE_H}`}
              className="w-full sm:hidden"
            >
              <GhostEdges
                flows={flows}
                positionFn={(_row, _col, step) => mobilePos(step!)}
              />
              <DiagramEdges
                flows={flows}
                activeNode={activeNode}
                hoveredEdge={hoveredEdge}
                setHoveredEdge={setHoveredEdge}
                isEdgeVisible={isEdgeVisible}
                positionFn={(_row, _col, step) => mobilePos(step!)}
              />
              <DiagramNodes
                categoryBlockCounts={categoryBlockCounts}
                connectedCategories={connectedCategories}
                activeNode={activeNode}
                isNodeActive={isNodeActive}
                hoveredNode={hoveredNode}
                setHoveredNode={setHoveredNode}
                selectedNode={selectedNode}
                setSelectedNode={setSelectedNode}
                positionFn={(_row, _col, step) => mobilePos(step!)}
                labelBelow={false}
              />
            </svg>

            {/* Edge tooltip */}
            {hoveredEdge && (
              <EdgeTooltip edgeKey={hoveredEdge} flows={flows} />
            )}

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 mt-3 text-[10px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 3" /></svg>
                Expected flow
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke="#3b82f6" strokeWidth="2.5" /></svg>
                Actual connection
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" /></svg>
                Isolated stage
              </span>
            </div>

            {activeNode && (
              <div className="mt-3 text-center">
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-[11px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                >
                  Clear filter — showing connections for{' '}
                  {CATEGORY_MAP[activeNode]?.label}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

// ─── Ghost (expected) edges ──────────────────────────────────────────────────

function GhostEdges({
  flows,
  positionFn,
}: {
  flows: CategoryFlow[];
  positionFn: (row: number, col: number, step?: number) => { x: number; y: number };
}) {
  // Build set of category pairs that have actual connections
  const coveredPairs = new Set(
    flows
      .filter((f) => f.from !== f.to)
      .map((f) => `${f.from}→${f.to}`),
  );

  return (
    <g>
      <defs>
        <marker
          id="ghost-arrowhead"
          markerWidth="6"
          markerHeight="5"
          refX="5"
          refY="2.5"
          orient="auto"
        >
          <polygon points="0 0, 6 2.5, 0 5" fill="#cbd5e1" />
        </marker>
      </defs>
      {EXPECTED_FLOW.map(([fromId, toId]) => {
        const fromCat = CATEGORY_MAP[fromId];
        const toCat = CATEGORY_MAP[toId];
        if (!fromCat || !toCat) return null;

        const isCovered = coveredPairs.has(`${fromId}→${toId}`);
        const p1 = positionFn(fromCat.row, fromCat.col, fromCat.step);
        const p2 = positionFn(toCat.row, toCat.col, toCat.step);
        const path = edgePath(p1.x, p1.y, p2.x, p2.y, false);

        return (
          <path
            key={`ghost-${fromId}-${toId}`}
            d={path}
            fill="none"
            stroke={isCovered ? '#e2e8f0' : '#cbd5e1'}
            strokeWidth={1.5}
            strokeDasharray="6 4"
            strokeOpacity={isCovered ? 0.3 : 0.6}
            markerEnd={isCovered ? undefined : 'url(#ghost-arrowhead)'}
            className="pointer-events-none"
          />
        );
      })}
    </g>
  );
}

// ─── Edge rendering ──────────────────────────────────────────────────────────

function DiagramEdges({
  flows,
  activeNode,
  hoveredEdge,
  setHoveredEdge,
  isEdgeVisible,
  positionFn,
}: {
  flows: CategoryFlow[];
  activeNode: CategoryId | null;
  hoveredEdge: string | null;
  setHoveredEdge: (id: string | null) => void;
  isEdgeVisible: (flow: CategoryFlow) => boolean;
  positionFn: (row: number, col: number, step?: number) => { x: number; y: number };
}) {
  return (
    <g>
      <defs>
        {flows.map((flow) => {
          const key = `${flow.from}→${flow.to}`;
          const sourceCat = CATEGORY_MAP[flow.from];
          return (
            <marker
              key={`head-${key}`}
              id={`flow-head-${key.replace('→', '-')}`}
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon
                points="0 0, 8 3, 0 6"
                fill={sourceCat?.color || '#94a3b8'}
              />
            </marker>
          );
        })}
      </defs>

      {flows.map((flow) => {
        const key = `${flow.from}→${flow.to}`;
        const visible = isEdgeVisible(flow);
        const isHovered = hoveredEdge === key;
        const sourceCat = CATEGORY_MAP[flow.from];
        const targetCat = CATEGORY_MAP[flow.to];
        if (!sourceCat || !targetCat) return null;

        const isSelf = flow.from === flow.to;
        const p1 = positionFn(sourceCat.row, sourceCat.col, sourceCat.step);
        const p2 = positionFn(targetCat.row, targetCat.col, targetCat.step);
        const path = edgePath(p1.x, p1.y, p2.x, p2.y, isSelf);

        const strokeWidth = Math.min(1 + flow.count * 1.2, 5);
        const opacity = !activeNode ? 1 : visible ? 1 : 0.1;

        // Midpoint for count label
        const mx = isSelf ? p1.x + NODE_R + 40 : (p1.x + p2.x) / 2;
        const my = isSelf ? p1.y : (p1.y + p2.y) / 2;

        return (
          <g key={key} style={{ opacity, transition: 'opacity 0.2s' }}>
            {/* Invisible wider hit area */}
            <path
              d={path}
              fill="none"
              stroke="transparent"
              strokeWidth={20}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredEdge(key)}
              onMouseLeave={() => setHoveredEdge(null)}
            />
            {/* Visible edge */}
            <path
              d={path}
              fill="none"
              stroke={sourceCat.color}
              strokeWidth={isHovered ? strokeWidth + 1 : strokeWidth}
              strokeOpacity={isHovered ? 1 : 0.7}
              markerEnd={`url(#flow-head-${key.replace('→', '-')})`}
              className="transition-all pointer-events-none"
            />
            {/* Count pill */}
            <g
              onMouseEnter={() => setHoveredEdge(key)}
              onMouseLeave={() => setHoveredEdge(null)}
              className="cursor-pointer"
            >
              <rect
                x={mx - 10}
                y={my - 9}
                width={20}
                height={18}
                rx={9}
                fill="white"
                stroke={sourceCat.color}
                strokeWidth={1}
                strokeOpacity={0.4}
              />
              <text
                x={mx}
                y={my + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={10}
                fontWeight={600}
                fill={sourceCat.color}
              >
                {flow.count}
              </text>
            </g>
          </g>
        );
      })}
    </g>
  );
}

// ─── Node rendering ──────────────────────────────────────────────────────────

function DiagramNodes({
  categoryBlockCounts,
  connectedCategories,
  activeNode,
  isNodeActive,
  hoveredNode: _hoveredNode,
  setHoveredNode,
  selectedNode,
  setSelectedNode,
  positionFn,
  labelBelow,
}: {
  categoryBlockCounts: Map<CategoryId, number>;
  connectedCategories: Set<CategoryId>;
  activeNode: CategoryId | null;
  isNodeActive: (id: CategoryId) => boolean;
  hoveredNode: CategoryId | null;
  setHoveredNode: (id: CategoryId | null) => void;
  selectedNode: CategoryId | null;
  setSelectedNode: (id: CategoryId | null) => void;
  positionFn: (row: number, col: number, step?: number) => { x: number; y: number };
  labelBelow: boolean;
}) {
  return (
    <g>
      {CATEGORIES.map((cat) => {
        const pos = positionFn(cat.row, cat.col, cat.step);
        const blockCount = categoryBlockCounts.get(cat.id) || 0;
        const hasBlocks = blockCount > 0;
        const isConnected = connectedCategories.has(cat.id);
        const active = isNodeActive(cat.id);
        const isSelected = selectedNode === cat.id;

        const opacity = !activeNode ? 1 : active ? 1 : 0.25;
        const Icon = cat.icon;

        return (
          <g
            key={cat.id}
            style={{ opacity, transition: 'opacity 0.2s' }}
            onMouseEnter={() => setHoveredNode(cat.id)}
            onMouseLeave={() => setHoveredNode(null)}
            onClick={() =>
              setSelectedNode(isSelected ? null : cat.id)
            }
            className="cursor-pointer"
          >
            {/* Selection ring */}
            {isSelected && (
              <circle
                cx={pos.x}
                cy={pos.y}
                r={NODE_R + 5}
                fill="none"
                stroke={cat.color}
                strokeWidth={2}
                strokeDasharray="4 2"
                opacity={0.6}
              />
            )}

            {/* Isolated warning ring — blocks exist but no connections */}
            {hasBlocks && !isConnected && (
              <circle
                cx={pos.x}
                cy={pos.y}
                r={NODE_R + 5}
                fill="none"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                opacity={0.7}
              />
            )}

            {/* Node circle */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={NODE_R}
              fill={hasBlocks ? cat.color : 'white'}
              stroke={cat.color}
              strokeWidth={hasBlocks ? 0 : 2}
              strokeDasharray={!hasBlocks ? '4 3' : undefined}
              opacity={hasBlocks ? 1 : 0.4}
            />

            {/* Icon */}
            <foreignObject
              x={pos.x - 10}
              y={pos.y - 10}
              width={20}
              height={20}
            >
              <div className="flex items-center justify-center w-full h-full">
                <Icon
                  size={16}
                  className={hasBlocks ? 'text-white' : 'text-slate-400'}
                />
              </div>
            </foreignObject>

            {/* Block count badge */}
            {hasBlocks && (
              <>
                <circle
                  cx={pos.x + NODE_R - 4}
                  cy={pos.y - NODE_R + 4}
                  r={8}
                  fill="white"
                  stroke={cat.color}
                  strokeWidth={1.5}
                />
                <text
                  x={pos.x + NODE_R - 4}
                  y={pos.y - NODE_R + 5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={9}
                  fontWeight={700}
                  fill={cat.color}
                >
                  {blockCount}
                </text>
              </>
            )}

            {/* Isolated warning icon */}
            {hasBlocks && !isConnected && (
              <foreignObject
                x={pos.x - NODE_R - 2}
                y={pos.y + NODE_R - 8}
                width={16}
                height={16}
              >
                <div className="flex items-center justify-center w-full h-full">
                  <AlertTriangle size={12} className="text-amber-500" />
                </div>
              </foreignObject>
            )}

            {/* Label */}
            {labelBelow ? (
              <text
                x={pos.x}
                y={pos.y + NODE_R + 14}
                textAnchor="middle"
                fontSize={11}
                fontWeight={600}
                fill={hasBlocks && !isConnected ? '#f59e0b' : hasBlocks ? '#334155' : '#94a3b8'}
              >
                {cat.label}
              </text>
            ) : (
              <text
                x={pos.x + NODE_R + 8}
                y={pos.y + 1}
                textAnchor="start"
                dominantBaseline="middle"
                fontSize={11}
                fontWeight={600}
                fill={hasBlocks && !isConnected ? '#f59e0b' : hasBlocks ? '#334155' : '#94a3b8'}
              >
                {cat.label}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

// ─── Edge Tooltip ────────────────────────────────────────────────────────────

function EdgeTooltip({
  edgeKey,
  flows,
}: {
  edgeKey: string;
  flows: CategoryFlow[];
}) {
  const flow = flows.find((f) => `${f.from}→${f.to}` === edgeKey);
  if (!flow) return null;

  const sourceCat = CATEGORY_MAP[flow.from];
  const targetCat = CATEGORY_MAP[flow.to];

  return (
    <div className="mt-3 mx-auto max-w-sm bg-white border border-slate-200 rounded-lg shadow-sm p-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2">
        <span style={{ color: sourceCat?.color }}>{sourceCat?.label}</span>
        <ArrowRight size={12} className="text-slate-300" />
        <span style={{ color: targetCat?.color }}>{targetCat?.label}</span>
        <span className="text-slate-400 font-normal ml-auto">
          {flow.count} connection{flow.count !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {flow.blockPairs.map((pair, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 text-[10px] bg-slate-50 border border-slate-100 rounded-full px-2 py-0.5 text-slate-600"
          >
            {pair.source}
            <ArrowRight size={8} className="text-slate-300" />
            {pair.target}
          </span>
        ))}
      </div>
    </div>
  );
}
