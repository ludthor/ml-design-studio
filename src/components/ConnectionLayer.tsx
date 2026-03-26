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

function getBlockAnchor(blockId: string, side: 'right' | 'left' | 'bottom' | 'top', container: HTMLElement) {
  const el = document.getElementById(`block-${blockId}`);
  if (!el) return null;
  const blockRect = el.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const scrollX = container.scrollLeft;
  const scrollY = container.scrollTop;
  const ox = -containerRect.left + scrollX;
  const oy = -containerRect.top + scrollY;

  switch (side) {
    case 'right':
      return { x: blockRect.right + ox, y: blockRect.top + blockRect.height / 2 + oy };
    case 'left':
      return { x: blockRect.left + ox, y: blockRect.top + blockRect.height / 2 + oy };
    case 'bottom':
      return { x: blockRect.left + blockRect.width / 2 + ox, y: blockRect.bottom + oy };
    case 'top':
      return { x: blockRect.left + blockRect.width / 2 + ox, y: blockRect.top + oy };
  }
}

function smoothPath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);

  // Vertical layout (mobile single-column): use vertical bezier
  if (dy > dx * 1.2) {
    const cp = Math.max(dy * 0.3, 30);
    const dirY = y2 > y1 ? 1 : -1;
    return `M ${x1} ${y1} C ${x1} ${y1 + cp * dirY}, ${x2} ${y2 - cp * dirY}, ${x2} ${y2}`;
  }
  // Horizontal layout (desktop grid)
  const cp = Math.max(dx * 0.4, 30);
  const dirX = x2 > x1 ? 1 : -1;
  return `M ${x1} ${y1} C ${x1 + cp * dirX} ${y1}, ${x2 - cp * dirX} ${y2}, ${x2} ${y2}`;
}

export default function ConnectionLayer() {
  const { state, dispatch } = useProject();
  const { connections, blocks } = state.project;
  const [arrows, setArrows] = useState<ArrowLine[]>([]);
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });

  const recalc = useCallback(() => {
    const container = document.getElementById('design-canvas');
    if (!container) return;

    const newArrows: ArrowLine[] = [];
    for (const conn of connections) {
      const sourceBlock = blocks.find((b) => b.id === conn.sourceBlockId);
      const targetBlock = blocks.find((b) => b.id === conn.targetBlockId);
      if (!sourceBlock || !targetBlock) continue;

      const startH = getBlockAnchor(conn.sourceBlockId, 'right', container);
      const endH = getBlockAnchor(conn.targetBlockId, 'left', container);
      if (!startH || !endH) continue;

      // Use block centers for layout detection (right/left edges are misleading on full-width blocks)
      const srcEl = document.getElementById(`block-${conn.sourceBlockId}`);
      const tgtEl = document.getElementById(`block-${conn.targetBlockId}`);
      if (!srcEl || !tgtEl) continue;
      const srcRect = srcEl.getBoundingClientRect();
      const tgtRect = tgtEl.getBoundingClientRect();
      const centerDx = Math.abs((srcRect.left + srcRect.width / 2) - (tgtRect.left + tgtRect.width / 2));
      const centerDy = Math.abs((srcRect.top + srcRect.height / 2) - (tgtRect.top + tgtRect.height / 2));
      const isVertical = centerDy > centerDx * 1.5;

      let start, end;
      if (isVertical) {
        // Vertical stacking (mobile): use bottom→top anchors
        const srcBelow = srcRect.top > tgtRect.top;
        start = getBlockAnchor(conn.sourceBlockId, srcBelow ? 'top' : 'bottom', container);
        end = getBlockAnchor(conn.targetBlockId, srcBelow ? 'bottom' : 'top', container);
        if (!start || !end) continue;
      } else {
        start = startH;
        end = endH;
      }

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

    // Size SVG to full scrollable content
    if (container) {
      setSvgSize({ w: container.scrollWidth, h: container.scrollHeight });
    }
  }, [connections, blocks, state.ui.selectedBlockId]);

  useEffect(() => {
    recalc();
    // Recalculate on scroll, resize, and periodically for layout shifts
    const container = document.getElementById('design-canvas');
    const handleUpdate = () => recalc();
    container?.addEventListener('scroll', handleUpdate);
    window.addEventListener('resize', handleUpdate);
    const interval = setInterval(() => { if (!document.hidden) recalc(); }, 500);
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
          className="absolute top-0 left-0 pointer-events-none hidden lg:block"
          style={{ zIndex: 5, width: svgSize.w || '100%', height: svgSize.h || '100%' }}
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
