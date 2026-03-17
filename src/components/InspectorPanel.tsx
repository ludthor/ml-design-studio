import { useProject } from '../context/ProjectContext';
import { CATEGORY_MAP } from '../data/categories';
import { findGlossaryEntry } from '../data/glossary';
import type { Block } from '../types';
import { Trash2, Copy, X, BookOpen } from 'lucide-react';

export default function InspectorPanel({ mobile }: { mobile?: boolean }) {
  const { dispatch, getSelectedBlock } = useProject();
  const block = getSelectedBlock();

  if (!block) {
    if (mobile) return null;
    return (
      <aside className="w-[280px] bg-white border-l border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Inspector
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-xs text-slate-400 text-center">
            Click a block on the canvas to inspect and edit it
          </p>
        </div>
      </aside>
    );
  }

  const cat = CATEGORY_MAP[block.category];

  const update = (updates: Partial<Block>) =>
    dispatch({ type: 'UPDATE_BLOCK', id: block.id, updates });

  const closeAction = mobile
    ? () => dispatch({ type: 'TOGGLE_UI', key: 'showMobileInspector', value: false })
    : () => dispatch({ type: 'SELECT_BLOCK', id: null });

  return (
    <aside className={mobile
      ? 'bg-white rounded-t-2xl flex flex-col overflow-hidden'
      : 'w-[280px] bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-hidden'
    }>
      {/* Header */}
      <div className="p-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: cat?.color }}
          />
          <h2 className="text-xs font-semibold text-slate-700 truncate">
            {block.label}
          </h2>
        </div>
        <button
          onClick={closeAction}
          className="text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <Field label="Label">
          <input
            type="text"
            value={block.label}
            onChange={(e) => update({ label: e.target.value })}
            className="input-field"
          />
        </Field>

        <Field label="Category">
          <span
            className="text-xs px-2 py-1 rounded-full font-medium"
            style={{ backgroundColor: cat?.bgColor, color: cat?.color }}
          >
            {cat?.label}
          </span>
        </Field>

        <Field label="Description">
          <textarea
            value={block.description}
            onChange={(e) => update({ description: e.target.value })}
            placeholder="Brief description of this design decision..."
            className="input-field min-h-[60px] resize-y"
            rows={2}
          />
        </Field>

        <Field label="Rationale / Justification">
          <textarea
            value={block.rationale}
            onChange={(e) => update({ rationale: e.target.value })}
            placeholder="Why did you choose this? What alternatives did you consider?"
            className="input-field min-h-[80px] resize-y"
            rows={3}
          />
        </Field>

        <Field label="Tags">
          <input
            type="text"
            value={block.tags.join(', ')}
            onChange={(e) =>
              update({
                tags: e.target.value
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
            }
            placeholder="e.g. nlp, deep-learning, baseline"
            className="input-field"
          />
        </Field>

        <Field label="Style">
          <select
            value={block.styleVariant}
            onChange={(e) =>
              update({
                styleVariant: e.target.value as Block['styleVariant'],
              })
            }
            className="input-field"
          >
            <option value="default">Default</option>
            <option value="highlight">Highlight</option>
            <option value="subtle">Subtle</option>
          </select>
        </Field>

        {block.isCustom && (
          <span className="inline-block text-[10px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
            Custom block
          </span>
        )}

        {/* Glossary insight */}
        <GlossaryInsight label={block.label} dispatch={dispatch} />
      </div>

      {/* Actions — sticky at bottom */}
      <div className="p-3 border-t border-slate-100 flex gap-2 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button
          onClick={() => dispatch({ type: 'DUPLICATE_BLOCK', id: block.id })}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Copy size={12} />
          Duplicate
        </button>
        <button
          onClick={() => dispatch({ type: 'DELETE_BLOCK', id: block.id })}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors cursor-pointer"
        >
          <Trash2 size={12} />
          Delete
        </button>
      </div>
    </aside>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-slate-500 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function GlossaryInsight({
  label,
  dispatch,
}: {
  label: string;
  dispatch: React.Dispatch<{ type: 'TOGGLE_UI'; key: 'showGlossary'; value: boolean }>;
}) {
  const entry = findGlossaryEntry(label);
  if (!entry) return null;

  return (
    <div className="bg-violet-50/70 rounded-lg p-2.5 space-y-1.5">
      <div className="flex items-center gap-1.5">
        <BookOpen size={10} className="text-violet-500" />
        <span className="text-[10px] font-semibold text-violet-600 uppercase tracking-wider">
          Key Insight
        </span>
      </div>
      <p className="text-[10px] text-violet-700 leading-snug">
        {entry.keyInsight}
      </p>
      {entry.pitfalls && (
        <p className="text-[10px] text-amber-700 leading-snug bg-amber-50 rounded px-2 py-1">
          ⚠ {entry.pitfalls}
        </p>
      )}
      <button
        onClick={() =>
          dispatch({ type: 'TOGGLE_UI', key: 'showGlossary', value: true })
        }
        className="text-[10px] text-violet-500 font-medium hover:text-violet-700 cursor-pointer"
      >
        Open Glossary →
      </button>
    </div>
  );
}
