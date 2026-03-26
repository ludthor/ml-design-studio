import { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { buildAssessmentData, generateAssessmentText } from '../utils/assessmentReport';
import {
  X,
  ClipboardCheck,
  Copy,
  Check,
  Download,
  GraduationCap,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react';
import { slugify } from '../utils/exportUtils';

type Tab = 'overview' | 'rubric' | 'rationale' | 'checks';

export default function AssessmentReportModal() {
  const { state, dispatch } = useProject();
  const [tab, setTab] = useState<Tab>('overview');
  const [copied, setCopied] = useState(false);

  if (!state.ui.showAssessment) return null;

  const data = buildAssessmentData(state.project);
  const plainText = generateAssessmentText(state.project);

  const close = () =>
    dispatch({ type: 'TOGGLE_UI', key: 'showAssessment', value: false });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may be blocked in some contexts
    }
  };

  const handleDownload = () => {
    const blob = new Blob([plainText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slugify(state.project.projectTitle)}-assessment.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <FileText size={12} /> },
    { id: 'rubric', label: 'Rubric', icon: <GraduationCap size={12} /> },
    { id: 'rationale', label: 'Rationale', icon: <Lightbulb size={12} /> },
    { id: 'checks', label: 'Checks', icon: <ClipboardCheck size={12} /> },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex items-end sm:items-center justify-center sm:p-4 modal-backdrop"
      onClick={close}
    >
      <div
        className="bg-white sm:rounded-xl shadow-xl w-full sm:max-w-2xl max-h-[90vh] flex flex-col
                   rounded-t-xl sm:rounded-b-xl modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header ──────────────────────────────────────── */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ClipboardCheck size={16} className="text-emerald-500" />
            <h2 className="text-sm font-semibold text-slate-800">
              Assessment Report
            </h2>
            {/* Grade badge */}
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: gradeColor(data.rubric.grade) + '18',
                color: gradeColor(data.rubric.grade),
              }}
            >
              {data.rubric.grade} — {data.rubric.totalScore}/{data.rubric.maxScore}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-slate-500 hover:bg-slate-100 rounded-md cursor-pointer"
              title="Copy full report to clipboard"
            >
              {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-slate-500 hover:bg-slate-100 rounded-md cursor-pointer"
              title="Download as text file"
            >
              <Download size={12} />
              Save
            </button>
            <button
              onClick={close}
              className="text-slate-400 hover:text-slate-600 cursor-pointer ml-1"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ─── Description ─────────────────────────────────── */}
        <div className="px-4 pt-2.5 pb-1 flex-shrink-0">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Comprehensive evaluation of the student's ML pipeline design — use this report for grading, feedback, and identifying areas for improvement.
          </p>
        </div>

        {/* ─── Tabs ────────────────────────────────────────── */}
        <div className="flex items-center gap-0.5 px-4 py-1.5 border-b border-slate-100 flex-shrink-0">
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
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* ─── Body ────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 p-4">
          {tab === 'overview' && <OverviewTab data={data} />}
          {tab === 'rubric' && <RubricTab data={data} />}
          {tab === 'rationale' && <RationaleTab data={data} project={state.project} />}
          {tab === 'checks' && <ChecksTab project={state.project} />}
        </div>
      </div>
    </div>
  );
}

/* ─── Grade color ─────────────────────────────────────────────────────── */

function gradeColor(grade: string): string {
  switch (grade) {
    case 'A': return '#10b981';
    case 'B': return '#3b82f6';
    case 'C': return '#f59e0b';
    case 'D': return '#f97316';
    default:  return '#ef4444';
  }
}

/* ─── Overview Tab ────────────────────────────────────────────────────── */

import type { AssessmentData } from '../utils/assessmentReport';
import type { Project } from '../types';
import { runValidation } from '../utils/validationRules';
import { generateHints } from '../utils/contextualHints';

function OverviewTab({ data }: { data: AssessmentData }) {
  const filledCats = data.categoryCoverage.filter((c) => c.filled).length;
  const totalCats = data.categoryCoverage.length;
  const rPct = data.rationaleStats.total > 0
    ? Math.round((data.rationaleStats.filled / data.rationaleStats.total) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard label="Grade" value={data.rubric.grade} sub={data.rubric.gradeLabel} color={gradeColor(data.rubric.grade)} />
        <StatCard label="Blocks" value={String(data.totalBlocks)} sub={`${filledCats}/${totalCats} categories`} />
        <StatCard label="Connections" value={String(data.totalConnections)} sub={`${data.crossCategoryConnections} cross-stage`} />
        <StatCard label="Rationale" value={`${rPct}%`} sub={`${data.rationaleStats.filled}/${data.rationaleStats.total} filled`} color={rPct >= 80 ? '#10b981' : rPct >= 50 ? '#f59e0b' : '#ef4444'} />
      </div>

      {/* Category coverage grid */}
      <div>
        <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Category Coverage</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {data.categoryCoverage.map((cat) => (
            <div
              key={cat.category}
              className={`text-[11px] px-2.5 py-1.5 rounded-md border ${
                cat.filled
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-red-200 bg-red-50 text-red-600'
              }`}
            >
              <span className="font-medium">{cat.category}</span>
              <span className="ml-1 opacity-70">
                {cat.filled ? `(${cat.count})` : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick flags */}
      <div>
        <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Quick Flags</h4>
        <div className="space-y-1">
          <FlagRow
            ok={data.checksWarn === 0}
            text={data.checksWarn === 0 ? 'All validation checks passed' : `${data.checksWarn} validation warning(s)`}
          />
          <FlagRow
            ok={data.hintsHigh === 0}
            text={data.hintsHigh === 0 ? 'No high-priority hints' : `${data.hintsHigh} high-priority design hint(s)`}
          />
          <FlagRow
            ok={data.rationaleStats.empty === 0}
            text={data.rationaleStats.empty === 0 ? 'All blocks have rationale' : `${data.rationaleStats.empty} block(s) missing rationale`}
          />
          <FlagRow
            ok={data.rationaleStats.shortCount === 0}
            text={data.rationaleStats.shortCount === 0 ? 'All rationales are substantive' : `${data.rationaleStats.shortCount} very short rationale(s) (<30 chars)`}
          />
          <FlagRow
            ok={data.crossCategoryConnections > 0}
            text={data.crossCategoryConnections > 0 ? `${data.crossCategoryConnections} cross-stage connection(s) show data flow` : 'No cross-stage connections — pipeline flow not shown'}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color?: string }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3 text-center">
      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold mt-0.5" style={{ color: color ?? '#334155' }}>{value}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
    </div>
  );
}

function FlagRow({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className="flex items-start gap-2 text-[11px]">
      {ok ? (
        <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />
      ) : (
        <AlertTriangle size={13} className="text-amber-500 mt-0.5 shrink-0" />
      )}
      <span className={ok ? 'text-slate-500' : 'text-amber-700'}>{text}</span>
    </div>
  );
}

/* ─── Rubric Tab ──────────────────────────────────────────────────────── */

function RubricTab({ data }: { data: AssessmentData }) {
  return (
    <div className="space-y-3">
      {/* Overall */}
      <div className="text-center py-3 bg-slate-50 rounded-lg">
        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Overall Score</p>
        <p className="text-3xl font-bold mt-1" style={{ color: gradeColor(data.rubric.grade) }}>
          {data.rubric.grade}
        </p>
        <p className="text-sm text-slate-500 mt-0.5">{data.rubric.gradeLabel} — {data.rubric.totalScore}/{data.rubric.maxScore} points</p>
      </div>

      {/* Dimensions */}
      {data.rubric.dimensions.map((dim) => {
        const pct = Math.round((dim.score / dim.maxScore) * 100);
        return (
          <div key={dim.id} className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700">{dim.label}</span>
              <span className="text-xs font-bold" style={{ color: pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444' }}>
                {dim.score}/{dim.maxScore}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  backgroundColor: pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>
            <p className="text-[11px] text-slate-500">{dim.feedback}</p>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Rationale Tab ───────────────────────────────────────────────────── */

function RationaleTab({ data, project }: { data: AssessmentData; project: Project }) {
  const blocks = project.blocks;

  // Classify blocks
  const empty = blocks.filter((b) => !b.rationale.trim());
  const short = blocks.filter((b) => b.rationale.trim().length > 0 && b.rationale.trim().length < 30);
  const good = blocks.filter((b) => b.rationale.trim().length >= 30);

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden flex">
          {data.rationaleStats.total > 0 && (
            <>
              <div
                className="h-full bg-emerald-400"
                style={{ width: `${(good.length / data.rationaleStats.total) * 100}%` }}
                title={`${good.length} good`}
              />
              <div
                className="h-full bg-amber-400"
                style={{ width: `${(short.length / data.rationaleStats.total) * 100}%` }}
                title={`${short.length} short`}
              />
              <div
                className="h-full bg-red-400"
                style={{ width: `${(empty.length / data.rationaleStats.total) * 100}%` }}
                title={`${empty.length} empty`}
              />
            </>
          )}
        </div>
        <span className="text-[10px] text-slate-400 shrink-0">
          {good.length} good · {short.length} short · {empty.length} empty
        </span>
      </div>

      {data.rationaleStats.total > 0 && (
        <p className="text-[11px] text-slate-400">
          Average rationale length: <span className="font-medium text-slate-600">{data.rationaleStats.avgLength} characters</span>
        </p>
      )}

      {/* Empty rationale blocks */}
      {empty.length > 0 && (
        <div>
          <h4 className="text-[11px] font-semibold text-red-600 mb-1.5 flex items-center gap-1">
            <AlertTriangle size={12} />
            Missing Rationale ({empty.length})
          </h4>
          <div className="space-y-1">
            {empty.map((b) => (
              <div key={b.id} className="text-[11px] px-2.5 py-1.5 bg-red-50 border border-red-100 rounded-md text-red-700">
                <span className="font-medium">{b.label}</span>
                <span className="text-red-400 ml-1">— {b.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Short rationale blocks */}
      {short.length > 0 && (
        <div>
          <h4 className="text-[11px] font-semibold text-amber-600 mb-1.5 flex items-center gap-1">
            <AlertTriangle size={12} />
            Very Short Rationale ({short.length})
          </h4>
          <div className="space-y-1">
            {short.map((b) => (
              <div key={b.id} className="text-[11px] px-2.5 py-1.5 bg-amber-50 border border-amber-100 rounded-md">
                <span className="font-medium text-amber-700">{b.label}</span>
                <span className="text-amber-400 ml-1">— {b.category}</span>
                <p className="text-amber-600 mt-0.5 italic">"{b.rationale.trim()}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Good rationale blocks */}
      {good.length > 0 && (
        <div>
          <h4 className="text-[11px] font-semibold text-emerald-600 mb-1.5 flex items-center gap-1">
            <CheckCircle2 size={12} />
            Substantive Rationale ({good.length})
          </h4>
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            {good.map((b) => (
              <details key={b.id} className="text-[11px] px-2.5 py-1.5 bg-emerald-50 border border-emerald-100 rounded-md group">
                <summary className="cursor-pointer font-medium text-emerald-700">
                  {b.label} <span className="text-emerald-400 font-normal">— {b.category} ({b.rationale.trim().length} chars)</span>
                </summary>
                <p className="text-emerald-600 mt-1 italic">"{b.rationale.trim()}"</p>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Checks Tab ──────────────────────────────────────────────────────── */

function ChecksTab({ project }: { project: Project }) {
  const checks = runValidation(project);
  const hints = generateHints(project);

  return (
    <div className="space-y-4">
      {/* Validation checks */}
      <div>
        <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Validation Checks ({checks.length})
        </h4>
        <div className="space-y-1">
          {checks.map((c) => (
            <div
              key={c.id}
              className={`flex items-start gap-2 text-[11px] px-2.5 py-1.5 rounded-md ${
                c.status === 'complete'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              {c.status === 'complete' ? (
                <CheckCircle2 size={13} className="shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={13} className="shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-medium">{c.label}</span>
                <span className="opacity-70 ml-1">— {c.message}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contextual hints */}
      <div>
        <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Contextual Hints ({hints.length})
        </h4>
        {hints.length === 0 ? (
          <p className="text-[11px] text-slate-400 italic">No hints triggered — design looks solid.</p>
        ) : (
          <div className="space-y-1">
            {hints.map((h) => (
              <div
                key={h.id}
                className={`text-[11px] px-2.5 py-1.5 rounded-md ${
                  h.priority === 'high'
                    ? 'bg-red-50 text-red-700'
                    : h.priority === 'medium'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-blue-50 text-blue-600'
                }`}
              >
                <span className="font-medium">{h.message}</span>
                <p className="opacity-70 mt-0.5">{h.suggestion}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
