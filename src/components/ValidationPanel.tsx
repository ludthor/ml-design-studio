import { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { runValidation } from '../utils/validationRules';
import { computeRubric } from '../utils/rubricScoring';
import { generateHints } from '../utils/contextualHints';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lightbulb,
  GraduationCap,
  ClipboardCheck,
  ChevronRight,
} from 'lucide-react';
import type { ValidationStatus, HintPriority } from '../types';

type Tab = 'score' | 'checks' | 'tips';

export default function ValidationPanel() {
  const { state } = useProject();
  const [tab, setTab] = useState<Tab>('score');

  if (!state.ui.showValidation) return null;

  const checks = runValidation(state.project);
  const rubric = computeRubric(state.project);
  const hints = generateHints(state.project);

  const completeCount = checks.filter((c) => c.status === 'complete').length;
  const warningCount = checks.filter(
    (c) => c.status === 'warning' || c.status === 'missing'
  ).length;

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'score',
      label: 'Score',
      icon: <GraduationCap size={12} />,
    },
    {
      id: 'checks',
      label: 'Checks',
      icon: <ClipboardCheck size={12} />,
      badge: warningCount > 0 ? warningCount : undefined,
    },
    {
      id: 'tips',
      label: 'Tips',
      icon: <Lightbulb size={12} />,
      badge: hints.length > 0 ? hints.length : undefined,
    },
  ];

  return (
    <div className="border-t border-slate-200 bg-white">
      {/* Tab bar */}
      <div className="flex items-center border-b border-slate-100">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 shrink-0" title="Evaluate your ML pipeline design with a rubric score, validation checks, and contextual tips.">
          Design Review
        </h3>
        <span className="hidden md:inline text-[10px] text-slate-400 shrink-0 mr-2 max-w-[260px] leading-tight" title="Evaluate your ML pipeline design with a rubric score, validation checks, and contextual tips.">
          Score, validate, and improve your pipeline design
        </span>
        <div className="flex items-center gap-0.5 ml-auto pr-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                tab === t.id
                  ? 'bg-slate-100 text-slate-700'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
              {t.badge !== undefined && (
                <span
                  className={`ml-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[9px] font-bold ${
                    tab === t.id
                      ? 'bg-slate-200 text-slate-600'
                      : 'bg-amber-100 text-amber-600'
                  }`}
                >
                  {t.badge}
                </span>
              )}
            </button>
          ))}
          {/* Compact score pill */}
          <div
            className="ml-2 flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold"
            style={{
              backgroundColor: scoreColor(rubric.totalScore, rubric.maxScore) + '15',
              color: scoreColor(rubric.totalScore, rubric.maxScore),
            }}
          >
            {rubric.totalScore}/{rubric.maxScore}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-h-[220px] overflow-y-auto">
        {tab === 'score' && <ScoreTab rubric={rubric} />}
        {tab === 'checks' && (
          <ChecksTab checks={checks} completeCount={completeCount} />
        )}
        {tab === 'tips' && <TipsTab hints={hints} />}
      </div>
    </div>
  );
}

// ── Score Tab ──────────────────────────────────────────────────────────────

function ScoreTab({
  rubric,
}: {
  rubric: ReturnType<typeof computeRubric>;
}) {
  return (
    <div className="p-3 space-y-2.5">
      {/* Overall score */}
      <div className="flex items-center gap-3 pb-2 border-b border-slate-50">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
          style={{
            backgroundColor: scoreColor(rubric.totalScore, rubric.maxScore) + '15',
            color: scoreColor(rubric.totalScore, rubric.maxScore),
          }}
        >
          {rubric.totalScore}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700">
            {rubric.totalScore} / {rubric.maxScore} points
          </p>
          <p className="text-[11px] text-slate-400">
            Across {rubric.dimensions.length} dimensions
          </p>
        </div>
        {/* Visual bar */}
        <div className="flex-1 ml-auto">
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(rubric.totalScore / rubric.maxScore) * 100}%`,
                backgroundColor: scoreColor(rubric.totalScore, rubric.maxScore),
              }}
            />
          </div>
        </div>
      </div>

      {/* Dimensions */}
      {rubric.dimensions.map((dim) => (
        <div key={dim.id} className="flex items-start gap-2">
          <div className="w-[100px] shrink-0">
            <p className="text-[11px] font-medium text-slate-600">{dim.label}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(dim.score / dim.maxScore) * 100}%`,
                    backgroundColor: dimColor(dim.score, dim.maxScore),
                  }}
                />
              </div>
              <span className="text-[9px] font-bold text-slate-400 w-6 text-right">
                {dim.score}/{dim.maxScore}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-snug flex-1 pt-0.5">
            {dim.feedback}
          </p>
        </div>
      ))}
    </div>
  );
}

// ── Checks Tab ────────────────────────────────────────────────────────────

function ChecksTab({
  checks,
  completeCount,
}: {
  checks: ReturnType<typeof runValidation>;
  completeCount: number;
}) {
  const statusIcons: Record<ValidationStatus, React.ReactNode> = {
    complete: <CheckCircle2 size={14} className="text-green-500 shrink-0" />,
    warning: <AlertTriangle size={14} className="text-amber-500 shrink-0" />,
    missing: <XCircle size={14} className="text-red-400 shrink-0" />,
  };

  const statusOrder: Record<ValidationStatus, number> = {
    missing: 0,
    warning: 1,
    complete: 2,
  };
  const sorted = [...checks].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status]
  );

  return (
    <div>
      <div className="px-3 py-1.5 flex items-center justify-between bg-slate-50/50">
        <span className="text-[10px] text-slate-400">
          {completeCount}/{checks.length} passed
        </span>
      </div>
      {sorted.map((check) => (
        <div
          key={check.id}
          className="flex items-start gap-2 px-3 py-2 border-b border-slate-50 last:border-b-0"
        >
          {statusIcons[check.status]}
          <div className="min-w-0">
            <p className="text-xs text-slate-700 font-medium">{check.label}</p>
            <p className="text-[10px] text-slate-400">{check.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Tips Tab ──────────────────────────────────────────────────────────────

function TipsTab({
  hints,
}: {
  hints: ReturnType<typeof generateHints>;
}) {
  const priorityIcons: Record<HintPriority, React.ReactNode> = {
    high: (
      <span className="w-5 h-5 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
        <AlertTriangle size={11} />
      </span>
    ),
    medium: (
      <span className="w-5 h-5 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
        <Lightbulb size={11} />
      </span>
    ),
    low: (
      <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
        <ChevronRight size={11} />
      </span>
    ),
  };

  if (hints.length === 0) {
    return (
      <div className="flex items-center justify-center p-6">
        <p className="text-xs text-slate-400">
          No tips right now — your design looks well thought-out!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="px-3 py-1.5 bg-slate-50/50">
        <span className="text-[10px] text-slate-400">
          {hints.filter((h) => h.priority === 'high').length > 0
            ? `${hints.filter((h) => h.priority === 'high').length} important tip(s)`
            : `${hints.length} suggestion(s)`}
        </span>
      </div>
      {hints.map((hint) => (
        <div
          key={hint.id}
          className="flex items-start gap-2 px-3 py-2 border-b border-slate-50 last:border-b-0"
        >
          {priorityIcons[hint.priority]}
          <div className="min-w-0">
            <p className="text-xs text-slate-700 font-medium">{hint.message}</p>
            {hint.suggestion && (
              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                {hint.suggestion}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────

function scoreColor(score: number, max: number): string {
  const pct = max > 0 ? score / max : 0;
  if (pct >= 0.8) return '#10b981';
  if (pct >= 0.6) return '#3b82f6';
  if (pct >= 0.4) return '#f59e0b';
  return '#ef4444';
}

function dimColor(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.8) return '#10b981';
  if (pct >= 0.6) return '#3b82f6';
  if (pct >= 0.4) return '#f59e0b';
  return '#ef4444';
}
