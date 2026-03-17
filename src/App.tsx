import { useEffect, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useState } from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import AppShell from './components/AppShell';
import type { CategoryId } from './types';

function AppInner() {
  const { dispatch, addBlock } = useProject();
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 10 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.type === 'library-block') {
      setActiveLabel(data.label);
    } else if (data?.type === 'placed-block') {
      setActiveLabel(data.label);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveLabel(null);
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Dropping a library block onto a category panel
    if (activeData?.type === 'library-block' && overData?.type === 'category') {
      addBlock(
        activeData.label,
        overData.categoryId as CategoryId,
        false,
        (activeData.description as string) || ''
      );
      return;
    }

    // Moving a placed block to a different category
    if (activeData?.type === 'placed-block' && overData?.type === 'category') {
      const blockId = activeData.blockId as string;
      const targetCategory = overData.categoryId as CategoryId;
      dispatch({
        type: 'MOVE_BLOCK',
        id: blockId,
        toCategory: targetCategory,
        toIndex: 999, // appends to end
      });
    }
  };

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Undo on Ctrl+Z / Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: 'UNDO' });
        return;
      }
      // Close modals on Escape
      if (e.key === 'Escape') {
        dispatch({ type: 'SELECT_BLOCK', id: null });
        dispatch({ type: 'SET_CONNECTION_SOURCE', id: null });
        dispatch({ type: 'TOGGLE_UI', key: 'showHelp', value: false });
        dispatch({ type: 'TOGGLE_UI', key: 'showExport', value: false });
        dispatch({ type: 'TOGGLE_UI', key: 'showSummary', value: false });
        dispatch({ type: 'TOGGLE_UI', key: 'showResetConfirm', value: false });
        dispatch({ type: 'TOGGLE_UI', key: 'showGlossary', value: false });
        dispatch({ type: 'TOGGLE_UI', key: 'showTemplates', value: false });
      }
      // Delete selected block
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInputFocused()) {
        dispatch({ type: 'DELETE_SELECTED' });
      }
    },
    [dispatch]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <AppShell />
      <DragOverlay dropAnimation={null}>
        {activeLabel ? (
          <div className="drag-overlay-block px-3 py-2 bg-white rounded-lg border border-blue-300 shadow-lg text-xs font-medium text-slate-700">
            {activeLabel}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function isInputFocused(): boolean {
  const tag = document.activeElement?.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

export default function App() {
  return (
    <ProjectProvider>
      <AppInner />
    </ProjectProvider>
  );
}
