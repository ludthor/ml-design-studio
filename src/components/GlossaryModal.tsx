import { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { GLOSSARY, searchGlossary } from '../data/glossary';
import { X, Search, BookOpen, AlertTriangle, Link2 } from 'lucide-react';
import type { GlossaryEntry } from '../types';

export default function GlossaryModal() {
  const { state, dispatch } = useProject();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<GlossaryEntry | null>(null);

  if (!state.ui.showGlossary) return null;

  const close = () => {
    dispatch({ type: 'TOGGLE_UI', key: 'showGlossary', value: false });
    setQuery('');
    setSelected(null);
  };

  const results = searchGlossary(query);

  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 modal-backdrop"
      onClick={close}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-violet-500" />
            <h2 className="text-sm font-semibold text-slate-800">
              ML Glossary
            </h2>
            <span className="text-[10px] text-slate-400">
              {GLOSSARY.length} terms
            </span>
          </div>
          <button
            onClick={close}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search terms, definitions, or related concepts..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelected(null);
              }}
              className="w-full pl-8 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-violet-300 focus:border-violet-300"
              autoFocus
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setSelected(null);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Content: list + detail */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Term list */}
          <div className="w-[200px] sm:w-[240px] border-r border-slate-100 overflow-y-auto shrink-0">
            {results.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-xs text-slate-400">No matching terms</p>
              </div>
            ) : (
              results.map((entry) => (
                <button
                  key={entry.term}
                  onClick={() => setSelected(entry)}
                  className={`w-full text-left px-3 py-2.5 border-b border-slate-50 cursor-pointer transition-colors ${
                    selected?.term === entry.term
                      ? 'bg-violet-50 border-l-2 border-l-violet-400'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <p
                    className={`text-xs font-medium ${
                      selected?.term === entry.term
                        ? 'text-violet-700'
                        : 'text-slate-700'
                    }`}
                  >
                    {entry.term}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                    {entry.definition}
                  </p>
                </button>
              ))
            )}
          </div>

          {/* Detail panel */}
          <div className="flex-1 overflow-y-auto p-4">
            {selected ? (
              <GlossaryDetail
                entry={selected}
                onNavigate={(term) => {
                  const found = GLOSSARY.find(
                    (g) => g.term.toLowerCase() === term.toLowerCase()
                  );
                  if (found) {
                    setSelected(found);
                    setQuery('');
                  }
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                <BookOpen size={32} className="text-slate-200" />
                <p className="text-xs text-slate-400">
                  Select a term to see its definition, key insights, and common
                  pitfalls
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GlossaryDetail({
  entry,
  onNavigate,
}: {
  entry: GlossaryEntry;
  onNavigate: (term: string) => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-slate-800">{entry.term}</h3>

      {/* Definition */}
      <div>
        <p className="text-xs text-slate-600 leading-relaxed">
          {entry.definition}
        </p>
      </div>

      {/* Key Insight */}
      <div className="bg-violet-50 rounded-lg p-3">
        <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wider mb-1">
          Key Insight
        </p>
        <p className="text-xs text-violet-800 leading-relaxed">
          {entry.keyInsight}
        </p>
      </div>

      {/* Pitfalls */}
      {entry.pitfalls && (
        <div className="bg-amber-50 rounded-lg p-3">
          <div className="flex items-center gap-1 mb-1">
            <AlertTriangle size={10} className="text-amber-600" />
            <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">
              Common Pitfalls
            </p>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            {entry.pitfalls}
          </p>
        </div>
      )}

      {/* Related Terms */}
      {entry.related && entry.related.length > 0 && (
        <div>
          <div className="flex items-center gap-1 mb-1.5">
            <Link2 size={10} className="text-slate-400" />
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Related Concepts
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {entry.related.map((term) => {
              const exists = GLOSSARY.some(
                (g) => g.term.toLowerCase() === term.toLowerCase()
              );
              return exists ? (
                <button
                  key={term}
                  onClick={() => onNavigate(term)}
                  className="px-2 py-1 text-[10px] font-medium text-violet-600 bg-violet-50 rounded-full hover:bg-violet-100 transition-colors cursor-pointer"
                >
                  {term}
                </button>
              ) : (
                <span
                  key={term}
                  className="px-2 py-1 text-[10px] font-medium text-slate-500 bg-slate-50 rounded-full"
                >
                  {term}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
