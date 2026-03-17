import { useDroppable } from '@dnd-kit/core';
import { useProject } from '../context/ProjectContext';
import type { CategoryDef } from '../types';
import { Plus } from 'lucide-react';
import DesignBlock from './DesignBlock';

const EMPTY_HINTS: Record<string, string> = {
  'problem-framing': 'e.g. Classification, Regression, Clustering',
  'data-sources': 'e.g. Images, Text, Tabular data',
  'preprocessing': 'e.g. Cleaning, Normalization, Tokenization',
  'modeling': 'e.g. CNN, Transformer, Ensemble',
  'training-optimization': 'e.g. Adam, Early stopping, Fine-tuning',
  'evaluation': 'e.g. Accuracy, F1-score, Confusion matrix',
  'output-deployment': 'e.g. API, Dashboard, Real-time inference',
  'risks-constraints': 'e.g. Bias, Privacy, Overfitting',
};

export default function CategoryPanel({ category }: { category: CategoryDef }) {
  const { dispatch, getBlocksForCategory } = useProject();
  const blocks = getBlocksForCategory(category.id);

  const { isOver, setNodeRef } = useDroppable({
    id: `category-${category.id}`,
    data: { type: 'category', categoryId: category.id },
  });

  const openSelector = () => {
    dispatch({ type: 'SET_MOBILE_SELECTOR', category: category.id });
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl border transition-all min-h-[120px] sm:min-h-[150px] lg:min-h-[180px] lg:h-full ${
        isOver
          ? 'border-blue-300 bg-blue-50/50 shadow-inner'
          : 'border-slate-200 bg-white'
      }`}
    >
      {/* Category header — tappable on mobile to open selector */}
      <div
        className="px-3 py-2 rounded-t-xl border-b lg:cursor-default cursor-pointer"
        style={{
          backgroundColor: category.bgColor,
          borderBottomColor: category.borderColor,
        }}
        onClick={(e) => {
          if (window.innerWidth < 1024) {
            e.stopPropagation();
            openSelector();
          }
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: category.color }}
          >
            <category.icon size={12} className="text-white" />
          </span>
          <span
            className="text-xs font-semibold"
            style={{ color: category.color }}
          >
            {category.label}
          </span>
          {/* Mobile + button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openSelector();
            }}
            className="lg:hidden ml-auto w-5 h-5 flex items-center justify-center rounded-full text-white cursor-pointer"
            style={{ backgroundColor: category.color }}
            title={`Add block to ${category.label}`}
          >
            <Plus size={12} strokeWidth={3} />
          </button>
          <span className="hidden lg:inline ml-auto text-[10px] font-medium text-slate-400">
            {blocks.length}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5 pl-[18px] leading-snug">
          {category.description}
        </p>
      </div>

      {/* Block drop zone */}
      <div className="flex-1 p-2 space-y-1.5">
        {blocks.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full min-h-[80px] gap-1 lg:cursor-default cursor-pointer"
            onClick={(e) => {
              if (window.innerWidth < 1024) {
                e.stopPropagation();
                openSelector();
              }
            }}
          >
            <p className="text-[11px] text-slate-300 font-medium">
              <span className="hidden lg:inline">Drop blocks here</span>
              <span className="lg:hidden">Tap to add blocks</span>
            </p>
            <p className="text-[10px] text-slate-300/70 italic">
              {EMPTY_HINTS[category.id] || ''}
            </p>
          </div>
        ) : (
          blocks.map((block) => <DesignBlock key={block.id} block={block} />)
        )}
      </div>
    </div>
  );
}
