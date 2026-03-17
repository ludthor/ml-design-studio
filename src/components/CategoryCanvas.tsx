import { CATEGORIES } from '../data/categories';
import CategoryPanel from './CategoryPanel';
import ConnectionLayer from './ConnectionLayer';
import { useProject } from '../context/ProjectContext';
import { ArrowRightLeft, GripVertical, MousePointerClick, X } from 'lucide-react';
import { useState } from 'react';

export default function CategoryCanvas() {
  const { state, dispatch } = useProject();
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  const hasBlocks = state.project.blocks.length > 0;
  const hasConnections = state.project.connections.length > 0;
  const showConnectionHint = hasBlocks && !hasConnections && !state.ui.connectionSource;
  const showWelcome = !hasBlocks && !welcomeDismissed;

  return (
    <div
      className="flex-1 overflow-auto p-2 sm:p-4 bg-slate-50 relative flex flex-col"
      id="design-canvas"
      onClick={() => {
        dispatch({ type: 'SELECT_BLOCK', id: null });
        dispatch({ type: 'SET_CONNECTION_SOURCE', id: null });
      }}
    >
      {/* Welcome overlay for empty canvas */}
      {showWelcome && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-sm px-8 py-6 max-w-md text-center relative">
            <button
              onClick={() => setWelcomeDismissed(true)}
              className="absolute top-3 right-3 text-slate-300 hover:text-slate-500 transition-colors cursor-pointer pointer-events-auto"
              title="Dismiss"
            >
              <X size={14} />
            </button>
            <h2 className="text-base font-semibold text-slate-700 mb-2">
              Welcome to the ML Design Studio
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Design the architecture of your ML project by dragging blocks from
              the library on the left into the category panels below.
            </p>
            <div className="flex justify-center gap-6 text-[11px] text-slate-400">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <GripVertical size={16} className="text-blue-400" />
                </div>
                <span>Drag blocks</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <MousePointerClick size={16} className="text-green-400" />
                </div>
                <span>Click to edit</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <ArrowRightLeft size={16} className="text-purple-400" />
                </div>
                <span>Connect blocks</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-3 lg:flex-1 min-h-0">
        {CATEGORIES.map((cat) => (
          <CategoryPanel key={cat.id} category={cat} />
        ))}
      </div>

      {/* Connection onboarding hint */}
      {showConnectionHint && (
        <div className="flex items-center justify-center gap-2 mt-3 py-2 text-[11px] text-slate-400 bg-white/60 rounded-lg border border-dashed border-slate-200">
          <ArrowRightLeft size={13} className="text-slate-300" />
          <span>
            <strong className="text-slate-500">Tip:</strong> Hover over a block and click the{' '}
            <span className="inline-block w-2 h-2 rounded-full bg-slate-300 align-middle" />{' '}
            dot to create connections between blocks
          </span>
        </div>
      )}

      <ConnectionLayer />
    </div>
  );
}
