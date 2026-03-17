import { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { BLOCK_LIBRARY } from '../data/blockLibrary';
import { CATEGORY_MAP } from '../data/categories';
import { X, Search, Plus, Check } from 'lucide-react';

export default function MobileBlockSelector() {
  const { state, dispatch, addBlock, getBlocksForCategory } = useProject();
  const categoryId = state.ui.mobileSelectorCategory;
  const [search, setSearch] = useState('');
  const [customLabel, setCustomLabel] = useState('');

  if (!categoryId) return null;

  const category = CATEGORY_MAP[categoryId];
  const existingBlocks = getBlocksForCategory(categoryId);
  const existingLabels = new Set(existingBlocks.map((b) => b.label));

  const templates = BLOCK_LIBRARY.filter(
    (t) =>
      t.category === categoryId &&
      t.label.toLowerCase().includes(search.toLowerCase())
  );

  const close = () => {
    dispatch({ type: 'SET_MOBILE_SELECTOR', category: null });
    setSearch('');
    setCustomLabel('');
  };

  const handleAdd = (label: string, description: string, isCustom: boolean) => {
    addBlock(label, categoryId, isCustom, description);
    close();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customLabel.trim();
    if (!trimmed) return;
    handleAdd(trimmed, '', true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={close} />
      <div className="relative z-10 w-full max-h-[75vh] bg-white rounded-t-2xl flex flex-col animate-slide-in-bottom">
        {/* Header */}
        <div
          className="flex items-center gap-2 px-4 py-3 border-b shrink-0 rounded-t-2xl"
          style={{ backgroundColor: category?.bgColor }}
        >
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
            style={{ backgroundColor: category?.color }}
          >
            {category?.step}
          </span>
          <div className="flex-1 min-w-0">
            <h3
              className="text-sm font-semibold truncate"
              style={{ color: category?.color }}
            >
              {category?.label}
            </h3>
            <p className="text-[10px] text-slate-400 truncate">
              Tap to add a block
            </p>
          </div>
          <button
            onClick={close}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/60 text-slate-500 hover:bg-white cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2 border-b shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              type="text"
              placeholder="Search blocks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-200"
              autoFocus
            />
          </div>
        </div>

        {/* Template list */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {templates.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-slate-400">
              No blocks match your search
            </div>
          )}
          {templates.map((t) => {
            const alreadyAdded = existingLabels.has(t.label);
            return (
              <button
                key={t.label}
                onClick={() => handleAdd(t.label, t.description, false)}
                className="w-full flex items-start gap-3 px-4 py-3 text-left border-b border-slate-100 active:bg-slate-50 transition-colors cursor-pointer"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                  style={{ backgroundColor: category?.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-slate-700">
                      {t.label}
                    </span>
                    {alreadyAdded && (
                      <span className="flex items-center gap-0.5 text-[9px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full font-medium">
                        <Check size={8} />
                        added
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                    {t.description}
                  </p>
                </div>
                <Plus
                  size={16}
                  className="shrink-0 mt-1 text-slate-300"
                />
              </button>
            );
          })}
        </div>

        {/* Custom block form */}
        <form
          onSubmit={handleCustomSubmit}
          className="px-4 py-3 border-t bg-slate-50 shrink-0 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Custom block name..."
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-200"
          />
          <button
            type="submit"
            disabled={!customLabel.trim()}
            className="px-3 py-2 text-sm font-medium rounded-lg text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: category?.color }}
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
