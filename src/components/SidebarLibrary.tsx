import { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import type { CategoryId } from '../types';
import { CATEGORIES } from '../data/categories';
import { BLOCK_LIBRARY } from '../data/blockLibrary';
import { useDraggable } from '@dnd-kit/core';
import { Search, ChevronDown, ChevronRight, Plus, X } from 'lucide-react';

export default function SidebarLibrary() {
  const { state, dispatch } = useProject();
  const [expandedCats, setExpandedCats] = useState<Set<string>>(
    new Set(CATEGORIES.map((c) => c.id))
  );
  const [showCustomForm, setShowCustomForm] = useState(false);

  const query = state.ui.searchQuery.toLowerCase().trim();

  const toggleCat = (catId: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  return (
    <aside className="w-[260px] bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-slate-100">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Block Library
        </h2>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search blocks..."
            value={state.ui.searchQuery}
            onChange={(e) =>
              dispatch({ type: 'SET_SEARCH_QUERY', query: e.target.value })
            }
            className="w-full pl-8 pr-8 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-md outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
          />
          {query && (
            <button
              onClick={() => dispatch({ type: 'SET_SEARCH_QUERY', query: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Custom block button */}
      <div className="px-3 py-2 border-b border-slate-100">
        <button
          onClick={() => setShowCustomForm(!showCustomForm)}
          className="flex items-center gap-1.5 text-xs text-blue-600 font-medium hover:text-blue-700 cursor-pointer"
        >
          <Plus size={14} />
          Create custom block
        </button>
        {showCustomForm && (
          <CustomBlockForm onClose={() => setShowCustomForm(false)} />
        )}
      </div>

      {/* Scrollable block list */}
      <div className="flex-1 overflow-y-auto p-2">
        {CATEGORIES.map((cat) => {
          const blocks = BLOCK_LIBRARY.filter(
            (b) =>
              b.category === cat.id &&
              (!query || b.label.toLowerCase().includes(query))
          );
          if (query && blocks.length === 0) return null;

          const isExpanded = expandedCats.has(cat.id);

          return (
            <div key={cat.id} className="mb-1">
              <button
                onClick={() => toggleCat(cat.id)}
                className="flex items-center gap-1.5 w-full px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded cursor-pointer"
              >
                {isExpanded ? (
                  <ChevronDown size={12} />
                ) : (
                  <ChevronRight size={12} />
                )}
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.label}
                <span className="ml-auto text-slate-400 text-[10px]">
                  {blocks.length}
                </span>
              </button>
              {isExpanded && (
                <div className="ml-2 mt-0.5 space-y-0.5">
                  {blocks.map((block) => (
                    <LibraryBlockItem
                      key={`${block.category}-${block.label}`}
                      label={block.label}
                      category={block.category}
                      color={cat.color}
                      description={block.description}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function LibraryBlockItem({
  label,
  category,
  color,
  description,
}: {
  label: string;
  category: CategoryId;
  color: string;
  description: string;
}) {
  const dragId = `library-${category}-${label}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
    data: { type: 'library-block', label, category, description },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`library-block-item group/tip relative px-2 py-1.5 text-xs text-slate-700 rounded cursor-grab hover:bg-slate-50 transition-colors select-none ${
        isDragging ? 'opacity-40' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-1 h-4 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="font-medium">{label}</span>
      </div>
      <p className="text-[10px] text-slate-400 leading-snug mt-0.5 pl-3 line-clamp-2">
        {description}
      </p>
    </div>
  );
}

function CustomBlockForm({ onClose }: { onClose: () => void }) {
  const { addBlock } = useProject();
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState<CategoryId>('problem-framing');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    addBlock(trimmed, category, true);
    setLabel('');
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2">
      <input
        type="text"
        placeholder="Block label..."
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded outline-none focus:ring-1 focus:ring-blue-300"
        autoFocus
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as CategoryId)}
        className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded outline-none focus:ring-1 focus:ring-blue-300"
      >
        {CATEGORIES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 cursor-pointer"
        >
          Add
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
