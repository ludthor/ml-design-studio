import { useEffect, useState, useCallback } from 'react';
import { useProject } from '../context/ProjectContext';
import { CATEGORY_MAP } from '../data/categories';

interface ArrowLine {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  highlighted: boolean;
  sourceLabel: string;
  targetLabel: string;
}

function getBlockCenter(blockId: string, side: 'right' | 'left', container: HTMLElement) {
  const el = document.getElementById(`block-${blockId}`);
  if (!el) return null;
  const blockRect = el.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const x = side === 'right'
    ? blockRect.right - containerRect.left + container.scrollLeft
    : blockRect.left - containerRect.left + container.scrollLeft;
  const y = blockRect.top + blockRect.height / 2 - containerRect.top + container.scrollTop;
  return { x, y };
}

function smoothPath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = Math.abs(x2 - x1);
  const cp = Math.max(dx * 0.4, 30);
  return `M ${x1} ${y1} C ${x1 + cp} ${y1}, ${x2 - cp} ${y2}, ${x2} ${y2}`;
}

export default function ConnectionLayer() {
  const { state, dispatch } = useProject();
  const { connections, blocks } = state.project;
  const [arrows, setArrows] = useState<ArrowLine[]>([]);

  const recalc = useCallback(() => {
    const container = document.getElementById('design-canvas');
    if (!container) return;

    const newArrows: ArrowLine[] = [];
    for (const conn of connections) {
      const sourceBlock = blocks.find((b) => b.id === conn.sourceBlockId);
      const targetBlock = blocks.find((b) => b.id === conn.targetBlockId);
      if (!sourceBlock || !targetBlock) continue;

      const start = getBlockCenter(conn.sourceBlockId, 'right', container);
      const end = getBlockCenter(conn.targetBlockId, 'left', container);
      if (!start || !end) continue;

      const sourceCat = CATEGORY_MAP[sourceBlock.category];
      const isRelated =
        state.ui.selectedBlockId === conn.sourceBlockId ||
        state.ui.selectedBlockId === conn.targetBlockId;

      newArrows.push({
        id: conn.id,
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y,
        color: isRelated ? sourceCat?.color || '#3b82f6' : '#cbd5e1',
        highlighted: isRelated,
        sourceLabel: sourceBlock.label,
        targetLabel: targetBlock.label,
      });
    }
    setArrows(newArrows);
  }, [connections, blocks, state.ui.selectedBlockId]);

  useEffect(() => {
    recalc();
    // Recalculate on scroll, resize, and periodically for layout shifts
    const container = document.getElementById('design-canvas');
    const handleUpdate = () => recalc();
    container?.addEventListener('scroll', handleUpdate);
    window.addEventListener('resize', handleUpdate);
    const interval = setInterval(recalc, 500);
    return () => {
      container?.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
      clearInterval(interval);
    };
  }, [recalc]);

  const isConnecting = state.ui.connectionSource !== null;

  const handleArrowClick = (arrow: ArrowLine) => {
    if (window.confirm(`Delete connection: ${arrow.sourceLabel} → ${arrow.targetLabel}?`)) {
      dispatch({ type: 'DELETE_CONNECTION', id: arrow.id });
    }
  };

  return (
    <>
      {arrows.length > 0 && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 5 }}
        >
          <defs>
            {arrows.map((a) => (
              <marker
                key={`head-${a.id}`}
                id={`arrowhead-${a.id}`}
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill={a.color} />
              </marker>
            ))}
          </defs>
          {arrows.map((a) => (
            <g key={a.id}>
              {/* Invisible wider path for easier clicking */}
              <path
                d={smoothPath(a.x1, a.y1, a.x2, a.y2)}
                fill="none"
                stroke="transparent"
                strokeWidth={16}
                className="pointer-events-auto cursor-pointer"
                onClick={() => handleArrowClick(a)}
              />
              {/* Visible path */}
              <path
                d={smoothPath(a.x1, a.y1, a.x2, a.y2)}
                fill="none"
                stroke={a.color}
                strokeWidth={a.highlighted ? 2.5 : 1.5}
                markerEnd={`url(#arrowhead-${a.id})`}
                className="pointer-events-none transition-colors"
              />
              {/* Delete button on highlighted connections */}
              {a.highlighted && (
                <foreignObject
                  x={(a.x1 + a.x2) / 2 - 8}
                  y={(a.y1 + a.y2) / 2 - 8}
                  width={16}
                  height={16}
                  className="pointer-events-auto"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({ type: 'DELETE_CONNECTION', id: a.id });
                    }}
                    className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] shadow-md hover:bg-red-600 cursor-pointer leading-none"
                    title="Delete connection"
                  >
                    ×
                  </button>
                </foreignObject>
              )}
            </g>
          ))}
        </svg>
      )}

      {/* Connection mode indicator */}
      {isConnecting && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full text-xs font-medium shadow-lg z-50 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Click another block's anchor to complete connection
          <button
            onClick={() => dispatch({ type: 'SET_CONNECTION_SOURCE', id: null })}
            className="ml-2 text-blue-200 hover:text-white underline cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}
    </>
  );
}
