import { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { STARTER_TEMPLATES } from '../data/starterTemplates';
import type { StarterTemplate } from '../data/starterTemplates';
import { X, LayoutTemplate, ChevronRight, AlertTriangle } from 'lucide-react';

const DIFFICULTY_BADGE: Record<string, { label: string; cls: string }> = {
  beginner: { label: 'Beginner', cls: 'bg-green-100 text-green-700' },
  intermediate: { label: 'Intermediate', cls: 'bg-amber-100 text-amber-700' },
  advanced: { label: 'Advanced', cls: 'bg-red-100 text-red-700' },
};

export default function TemplateGallery() {
  const { state, dispatch } = useProject();
  const [preview, setPreview] = useState<StarterTemplate | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (!state.ui.showTemplates) return null;

  const hasBlocks = state.project.blocks.length > 0;

  const close = () => {
    dispatch({ type: 'TOGGLE_UI', key: 'showTemplates', value: false });
    setPreview(null);
    setConfirmId(null);
  };

  const loadTemplate = (tpl: StarterTemplate) => {
    if (hasBlocks && confirmId !== tpl.id) {
      setConfirmId(tpl.id);
      return;
    }
    const project = tpl.build();
    dispatch({ type: 'LOAD_PROJECT', project });
    close();
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex items-end sm:items-center justify-center sm:p-4 modal-backdrop"
      onClick={close}
    >
      <div
        className="bg-white sm:rounded-xl shadow-xl w-full sm:max-w-3xl max-h-[90vh] flex flex-col
                   rounded-t-xl sm:rounded-b-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <LayoutTemplate size={16} className="text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-800">
              Starter Templates
            </h2>
            <span className="text-[10px] text-slate-400">
              {STARTER_TEMPLATES.length} projects
            </span>
          </div>
          <button
            onClick={close}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* ─── Description ──────────────────────────────────── */}
        <div className="px-4 pt-2.5 pb-1 flex-shrink-0">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Start from a pre-built ML project to explore how a complete pipeline fits together. Each template includes blocks with filled rationale, connections, and covers all 8 design categories — load one and customize it to learn by example.
          </p>
        </div>

        {/* ─── Body ────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 p-4">
          {/* Mobile: preview detail replaces list */}
          {preview ? (
            <TemplateDetail
              tpl={preview}
              hasBlocks={hasBlocks}
              confirmId={confirmId}
              onBack={() => { setPreview(null); setConfirmId(null); }}
              onLoad={() => loadTemplate(preview)}
              onConfirm={() => setConfirmId(preview.id)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STARTER_TEMPLATES.map((tpl) => (
                <TemplateCard
                  key={tpl.id}
                  tpl={tpl}
                  hasBlocks={hasBlocks}
                  confirmId={confirmId}
                  onPreview={() => setPreview(tpl)}
                  onLoad={() => loadTemplate(tpl)}
                  onConfirm={() => setConfirmId(tpl.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ─── Footer hint ─────────────────────────────────────── */}
        <div className="px-4 py-2.5 border-t border-slate-100 flex-shrink-0">
          <p className="text-[10px] text-slate-400 text-center">
            Templates load pre-built blocks and connections as a starting point — you can edit everything after loading.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Card Component ────────────────────────────────────────────────────── */

function TemplateCard({
  tpl,
  hasBlocks,
  confirmId,
  onPreview,
  onLoad,
  onConfirm,
}: {
  tpl: StarterTemplate;
  hasBlocks: boolean;
  confirmId: string | null;
  onPreview: () => void;
  onLoad: () => void;
  onConfirm: () => void;
}) {
  const badge = DIFFICULTY_BADGE[tpl.difficulty];
  const isConfirming = confirmId === tpl.id;

  return (
    <div
      className="group relative border border-slate-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-sm
                 transition-all cursor-pointer flex flex-col gap-2"
      onClick={onPreview}
    >
      {/* Icon + Title */}
      <div className="flex items-start gap-3">
        <span
          className="flex items-center justify-center w-10 h-10 rounded-lg text-lg flex-shrink-0"
          style={{ backgroundColor: tpl.accentColor + '18' }}
        >
          {tpl.icon}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-slate-800 leading-tight">
            {tpl.title}
          </h3>
          <p className="text-[11px] text-slate-500">{tpl.subtitle}</p>
        </div>
        <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-400 flex-shrink-0 mt-1 sm:hidden" />
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${badge.cls}`}>
          {badge.label}
        </span>
        <span className="text-[10px] text-slate-400">{tpl.blockCount} blocks</span>
      </div>

      {/* Description */}
      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
        {tpl.description}
      </p>

      {/* Tags */}
      <div className="flex gap-1 flex-wrap">
        {tpl.tags.map((t) => (
          <span key={t} className="text-[9px] bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">
            {t}
          </span>
        ))}
      </div>

      {/* Load button (desktop – visible on hover) */}
      <div className="hidden sm:block mt-1">
        {isConfirming ? (
          <div
            className="flex items-center gap-1.5 text-amber-600 bg-amber-50 rounded-md px-3 py-1.5"
            onClick={(e) => { e.stopPropagation(); onLoad(); }}
          >
            <AlertTriangle size={12} />
            <span className="text-[11px] font-medium">
              This will replace your current project. Click to confirm.
            </span>
          </div>
        ) : (
          <button
            className="w-full text-[11px] font-medium text-white rounded-md py-1.5 cursor-pointer
                       opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: tpl.accentColor }}
            onClick={(e) => {
              e.stopPropagation();
              if (hasBlocks) onConfirm();
              else onLoad();
            }}
          >
            Use this template
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Detail View (mobile drill-in) ────────────────────────────────────── */

function TemplateDetail({
  tpl,
  hasBlocks,
  confirmId,
  onBack,
  onLoad,
  onConfirm,
}: {
  tpl: StarterTemplate;
  hasBlocks: boolean;
  confirmId: string | null;
  onBack: () => void;
  onLoad: () => void;
  onConfirm: () => void;
}) {
  const badge = DIFFICULTY_BADGE[tpl.difficulty];
  const isConfirming = confirmId === tpl.id;

  return (
    <div className="flex flex-col gap-4">
      {/* Back */}
      <button
        onClick={onBack}
        className="text-[11px] text-indigo-500 hover:text-indigo-700 self-start flex items-center gap-1 cursor-pointer"
      >
        <ChevronRight size={12} className="rotate-180" />
        Back to templates
      </button>

      {/* Hero */}
      <div className="flex items-start gap-4">
        <span
          className="flex items-center justify-center w-14 h-14 rounded-xl text-2xl flex-shrink-0"
          style={{ backgroundColor: tpl.accentColor + '18' }}
        >
          {tpl.icon}
        </span>
        <div>
          <h3 className="text-base font-bold text-slate-800">{tpl.title}</h3>
          <p className="text-xs text-slate-500">{tpl.subtitle}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${badge.cls}`}>
              {badge.label}
            </span>
            <span className="text-[10px] text-slate-400">{tpl.blockCount} blocks</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-600 leading-relaxed">{tpl.description}</p>

      {/* Tags */}
      <div className="flex gap-1.5 flex-wrap">
        {tpl.tags.map((t) => (
          <span key={t} className="text-[10px] bg-slate-100 text-slate-600 rounded-md px-2 py-0.5">
            {t}
          </span>
        ))}
      </div>

      {/* Load */}
      {isConfirming ? (
        <div
          className="flex items-center gap-2 text-amber-600 bg-amber-50 rounded-lg px-4 py-3 cursor-pointer"
          onClick={onLoad}
        >
          <AlertTriangle size={14} />
          <span className="text-xs font-medium">
            This will replace your current project. Tap to confirm.
          </span>
        </div>
      ) : (
        <button
          className="w-full text-xs font-semibold text-white rounded-lg py-3 cursor-pointer"
          style={{ backgroundColor: tpl.accentColor }}
          onClick={() => {
            if (hasBlocks) onConfirm();
            else onLoad();
          }}
        >
          Use this template
        </button>
      )}
    </div>
  );
}
