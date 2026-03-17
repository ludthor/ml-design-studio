import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useProject } from '../context/ProjectContext';
import { CATEGORY_MAP } from '../data/categories';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import type { Block } from '../types';

export default function DesignBlock({ block }: { block: Block }) {
  const { state, dispatch } = useProject();
  const cat = CATEGORY_MAP[block.category];
  const isSelected = state.ui.selectedBlockId === block.id;
  const isConnectionSource = state.ui.connectionSource === block.id;

  // Get connected blocks for mobile pills
  const outgoing = state.project.connections
    .filter((c) => c.sourceBlockId === block.id)
    .map((c) => state.project.blocks.find((b) => b.id === c.targetBlockId))
    .filter(Boolean) as Block[];
  const incoming = state.project.connections
    .filter((c) => c.targetBlockId === block.id)
    .map((c) => state.project.blocks.find((b) => b.id === c.sourceBlockId))
    .filter(Boolean) as Block[];
  const hasConnections = outgoing.length > 0 || incoming.length > 0;

  // Make block draggable so it can be moved between categories
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: `placed-${block.id}`,
    data: { type: 'placed-block', blockId: block.id, label: block.label },
  });

  // Make block act as a droppable that maps to its parent category
  const { setNodeRef: setDropRef } = useDroppable({
    id: `block-drop-${block.id}`,
    data: { type: 'category', categoryId: block.category },
  });

  // Combine both refs
  const setNodeRef = (el: HTMLElement | null) => {
    setDragRef(el);
    setDropRef(el);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'SELECT_BLOCK', id: block.id });
  };

  const handleAnchorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const connSource = state.ui.connectionSource;
    if (connSource && connSource !== block.id) {
      dispatch({
        type: 'ADD_CONNECTION',
        sourceBlockId: connSource,
        targetBlockId: block.id,
      });
    } else {
      dispatch({ type: 'SET_CONNECTION_SOURCE', id: block.id });
    }
  };

  const styleClasses =
    block.styleVariant === 'highlight'
      ? 'ring-2 ring-offset-1'
      : block.styleVariant === 'subtle'
        ? 'opacity-60'
        : '';

  return (
    <div
      ref={setNodeRef}
      id={`block-${block.id}`}
      className={`group relative px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-all select-none ${styleClasses} ${
        isSelected
          ? 'ring-2 ring-blue-400 ring-offset-1 shadow-md'
          : 'hover:shadow-sm'
      } ${isConnectionSource ? 'ring-2 ring-green-400 ring-offset-1' : ''} ${
        isDragging ? 'opacity-30' : ''
      }`}
      style={{
        backgroundColor: isSelected ? cat?.lightBg : 'white',
        borderColor: isSelected ? cat?.color : cat?.borderColor,
      }}
      onClick={handleClick}
      {...listeners}
      {...attributes}
    >
      {/* Left anchor */}
      <div
        className={`connection-anchor left opacity-0 group-hover:opacity-100 ${
          state.ui.connectionSource ? 'opacity-100 connecting-mode' : ''
        } ${isConnectionSource ? 'active' : ''}`}
        onClick={handleAnchorClick}
        title="Click to connect"
      />

      {/* Content */}
      <div className="flex items-center gap-1.5 pr-2">
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: cat?.color }}
        />
        <span className="font-medium text-slate-700 truncate">
          {block.label}
        </span>
        {block.isCustom && (
          <span className="text-[9px] text-blue-500 font-medium">✦</span>
        )}
      </div>
      {block.description && (
        <p className="text-[10px] text-slate-400 mt-0.5 truncate pl-3">
          {block.description}
        </p>
      )}

      {/* Mobile connection pills — show connected block names */}
      {hasConnections && (
        <div className="lg:hidden flex flex-wrap gap-1 mt-1.5 pl-3">
          {outgoing.map((target) => {
            const tCat = CATEGORY_MAP[target.category];
            return (
              <span
                key={`out-${target.id}`}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium"
                style={{
                  backgroundColor: tCat?.bgColor || '#f1f5f9',
                  color: tCat?.color || '#64748b',
                }}
              >
                <ArrowRight size={8} />
                {target.label}
              </span>
            );
          })}
          {incoming.map((source) => {
            const sCat = CATEGORY_MAP[source.category];
            return (
              <span
                key={`in-${source.id}`}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium"
                style={{
                  backgroundColor: sCat?.bgColor || '#f1f5f9',
                  color: sCat?.color || '#64748b',
                }}
              >
                <ArrowLeft size={8} />
                {source.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Hover popover — shows full description */}
      {block.description && (
        <div className="block-popover">
          <div className="font-medium text-slate-700 mb-0.5">{block.label}</div>
          <div className="text-slate-500">{block.description}</div>
        </div>
      )}

      {/* Right anchor */}
      <div
        className={`connection-anchor right opacity-0 group-hover:opacity-100 ${
          state.ui.connectionSource ? 'opacity-100 connecting-mode' : ''
        } ${isConnectionSource ? 'active' : ''}`}
        onClick={handleAnchorClick}
        title="Click to connect"
      />
    </div>
  );
}
