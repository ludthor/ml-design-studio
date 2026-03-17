import { useProject } from '../context/ProjectContext';
import { generateSummary } from '../utils/generateSummary';
import { CATEGORIES } from '../data/categories';
import { CATEGORY_MAP } from '../data/categories';
import { X, Copy, Check, ArrowRight, FileText, Calendar, Layers, Link2 } from 'lucide-react';
import { useState } from 'react';

export default function SummaryModal() {
  const { state, dispatch } = useProject();
  const [copied, setCopied] = useState(false);

  if (!state.ui.showSummary) return null;

  const { project } = state;
  const plainText = generateSummary(project);
  const totalBlocks = project.blocks.length;
  const filledCategories = CATEGORIES.filter((cat) =>
    project.blocks.some((b) => b.category === cat.id)
  ).length;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const close = () =>
    dispatch({ type: 'TOGGLE_UI', key: 'showSummary', value: false });

  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 modal-backdrop"
      onClick={close}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col modal-content overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <FileText size={14} className="text-slate-400" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Project Summary
                </span>
              </div>
              <h2 className="text-lg font-bold truncate">
                {project.projectTitle || 'Untitled Project'}
              </h2>
              <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar size={10} />
                  {new Date().toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Layers size={10} />
                  {totalBlocks} block{totalBlocks !== 1 ? 's' : ''} · {filledCategories}/{CATEGORIES.length} categories
                </span>
                <span className="flex items-center gap-1">
                  <Link2 size={10} />
                  {project.connections.length} connection{project.connections.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4 shrink-0">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy text'}
              </button>
              <button
                onClick={close}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {CATEGORIES.map((cat) => {
            const catDef = CATEGORY_MAP[cat.id];
            const blocks = project.blocks
              .filter((b) => b.category === cat.id)
              .sort((a, b) => a.sortIndex - b.sortIndex);

            return (
              <div key={cat.id}>
                {/* Category header */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                    style={{ backgroundColor: catDef?.color || '#94a3b8' }}
                  >
                    {catDef?.step || '·'}
                  </span>
                  <h3 className="text-xs font-semibold text-slate-700">{cat.label}</h3>
                  <span className="text-[10px] text-slate-400">
                    {blocks.length > 0 ? `${blocks.length} block${blocks.length !== 1 ? 's' : ''}` : ''}
                  </span>
                </div>

                {blocks.length === 0 ? (
                  <p className="text-[11px] text-slate-300 italic pl-7 mb-1">
                    No blocks defined
                  </p>
                ) : (
                  <div className="pl-7 space-y-1.5">
                    {blocks.map((block) => (
                      <div
                        key={block.id}
                        className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2"
                      >
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-medium text-slate-700">
                            {block.label}
                          </span>
                          {block.tags.length > 0 && (
                            <div className="flex gap-1">
                              {block.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-200/80 text-slate-500"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {block.description && (
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            {block.description}
                          </p>
                        )}
                        {block.rationale && (
                          <p className="text-[11px] text-slate-400 mt-1 italic border-l-2 border-slate-200 pl-2">
                            {block.rationale}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Connections */}
          {project.connections.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-md flex items-center justify-center bg-slate-600 shrink-0">
                  <Link2 size={10} className="text-white" />
                </span>
                <h3 className="text-xs font-semibold text-slate-700">Connections</h3>
                <span className="text-[10px] text-slate-400">
                  {project.connections.length}
                </span>
              </div>
              <div className="pl-7 flex flex-wrap gap-1.5">
                {project.connections.map((conn) => {
                  const src = project.blocks.find((b) => b.id === conn.sourceBlockId);
                  const tgt = project.blocks.find((b) => b.id === conn.targetBlockId);
                  if (!src || !tgt) return null;
                  const srcCat = CATEGORY_MAP[src.category];
                  return (
                    <span
                      key={conn.id}
                      className="inline-flex items-center gap-1 text-[10px] bg-slate-50 border border-slate-100 rounded-full px-2.5 py-1 text-slate-600"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: srcCat?.color || '#94a3b8' }}
                      />
                      {src.label}
                      <ArrowRight size={8} className="text-slate-300" />
                      {tgt.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 text-center">
          <p className="text-[10px] text-slate-400">
            ML Project Design Studio · by Ariel Ortiz-Beltrán PhD, powered by Claude Opus 4.6
          </p>
        </div>
      </div>
    </div>
  );
}
