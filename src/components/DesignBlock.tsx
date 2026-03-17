import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useProject } from '../context/ProjectContext';
import { CATEGORY_MAP } from '../data/categories';
import type { Block } from '../types';

export default function DesignBlock({ block }: { block: Block }) {
  const { state, dispatch } = useProject();
  const cat = CATEGORY_MAP[block.category];
  const isSelected = state.ui.selectedBlockId === block.id;
  const isConnectionSource = state.ui.connectionSource === block.id;

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
          state.ui.connectionSource ? 'opacity-100' : ''
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
          state.ui.connectionSource ? 'opacity-100' : ''
        } ${isConnectionSource ? 'active' : ''}`}
        onClick={handleAnchorClick}
        title="Click to connect"
      />
    </div>
  );
}
