import { useProject } from '../context/ProjectContext';
import {
  Download,
  RotateCcw,
  HelpCircle,
  FileText,
  CheckSquare,
  Undo2,
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';

export default function TopBar() {
  const { state, dispatch } = useProject();
  const { project, isDirty, lastSavedAt } = state;

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3 shrink-0 shadow-sm z-20">
      {/* App title */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-xs">DS</span>
        </div>
        <div className="hidden lg:flex flex-col leading-tight">
          <span className="font-semibold text-slate-700 text-sm whitespace-nowrap">
            ML Project Design Studio
          </span>
          <span className="text-[9px] whitespace-nowrap flex items-center gap-1">
            <span className="text-slate-400">by</span>
            <span className="font-semibold text-slate-600">Ariel Ortiz-Beltrán PhD</span>
            <span className="text-slate-300">×</span>
            <span className="font-medium bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Claude Opus 4.6</span>
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-slate-200" />

      {/* Project title — editable */}
      <input
        type="text"
        value={project.projectTitle}
        onChange={(e) =>
          dispatch({ type: 'SET_PROJECT_TITLE', title: e.target.value })
        }
        className="flex-1 min-w-0 text-sm font-medium text-slate-800 bg-transparent border-none outline-none px-2 py-1 rounded hover:bg-slate-50 focus:bg-slate-50 focus:ring-1 focus:ring-blue-300 transition-colors"
        placeholder="Project title..."
      />

      {/* Status */}
      <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:block">
        {isDirty ? (
          <span className="text-amber-500">● Unsaved</span>
        ) : lastSavedAt ? (
          <span className="text-green-500">● Saved</span>
        ) : null}
      </span>

      {/* Progress indicator */}
      <ProgressPill blocks={state.project.blocks} />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <ToolbarBtn
          icon={<Undo2 size={16} />}
          label="Undo"
          onClick={() => dispatch({ type: 'UNDO' })}
          disabled={state.undoStack.length === 0}
        />
        <ToolbarBtn
          icon={<CheckSquare size={16} />}
          label="Checks"
          onClick={() => dispatch({ type: 'TOGGLE_UI', key: 'showValidation' })}
          active={state.ui.showValidation}
        />
        <ToolbarBtn
          icon={<FileText size={16} />}
          label="Summary"
          onClick={() => dispatch({ type: 'TOGGLE_UI', key: 'showSummary', value: true })}
        />
        <ToolbarBtn
          icon={<Download size={16} />}
          label="Export"
          onClick={() => dispatch({ type: 'TOGGLE_UI', key: 'showExport', value: true })}
        />
        <ToolbarBtn
          icon={<RotateCcw size={16} />}
          label="Reset"
          onClick={() => dispatch({ type: 'TOGGLE_UI', key: 'showResetConfirm', value: true })}
          variant="danger"
        />
        <ToolbarBtn
          icon={<HelpCircle size={16} />}
          label="Help"
          onClick={() => dispatch({ type: 'TOGGLE_UI', key: 'showHelp', value: true })}
        />
      </div>
    </header>
  );
}

function ToolbarBtn({
  icon,
  label,
  onClick,
  active,
  variant,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  variant?: 'danger';
  disabled?: boolean;
}) {
  const base =
    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer';
  const styles =
    disabled
      ? 'text-slate-300 cursor-default'
      : variant === 'danger'
        ? 'text-red-600 hover:bg-red-50'
        : active
          ? 'text-blue-600 bg-blue-50'
          : 'text-slate-600 hover:bg-slate-100';

  return (
    <button
      className={`${base} ${styles}`}
      onClick={disabled ? undefined : onClick}
      title={label}
      disabled={disabled}
    >
      {icon}
      <span className="hidden xl:inline">{label}</span>
    </button>
  );
}

function ProgressPill({ blocks }: { blocks: { category: string }[] }) {
  const filledCount = CATEGORIES.filter((cat) =>
    blocks.some((b) => b.category === cat.id)
  ).length;
  const total = CATEGORIES.length;

  if (blocks.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-full" title={`${filledCount} of ${total} categories filled`}>
      <div className="flex gap-0.5">
        {CATEGORIES.map((cat) => {
          const filled = blocks.some((b) => b.category === cat.id);
          return (
            <div
              key={cat.id}
              className="w-1.5 h-1.5 rounded-full transition-colors"
              style={{ backgroundColor: filled ? cat.color : '#e2e8f0' }}
            />
          );
        })}
      </div>
      <span className="text-[10px] font-medium text-slate-400">{filledCount}/{total}</span>
    </div>
  );
}
