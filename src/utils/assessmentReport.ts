import type { Project } from '../types';
import { CATEGORIES } from '../data/categories';
import { computeRubric } from './rubricScoring';
import { runValidation } from './validationRules';
import { generateHints } from './contextualHints';

export interface AssessmentData {
  projectTitle: string;
  date: string;
  // Block stats
  totalBlocks: number;
  categoryCoverage: { category: string; count: number; filled: boolean }[];
  totalConnections: number;
  crossCategoryConnections: number;
  // Rationale quality
  rationaleStats: {
    filled: number;
    empty: number;
    total: number;
    avgLength: number;
    shortCount: number; // <30 chars
  };
  // Rubric
  rubric: ReturnType<typeof computeRubric>;
  // Validation
  checksPass: number;
  checksWarn: number;
  checksTotal: number;
  // Hints
  hintsHigh: number;
  hintsMedium: number;
  hintsLow: number;
}

export function buildAssessmentData(project: Project): AssessmentData {
  const blocks = project.blocks;
  const rubric = computeRubric(project);
  const checks = runValidation(project);
  const hints = generateHints(project);

  const categoryCoverage = CATEGORIES.map((cat) => {
    const catBlocks = blocks.filter((b) => b.category === cat.id);
    return { category: cat.label, count: catBlocks.length, filled: catBlocks.length > 0 };
  });

  const crossCategoryConnections = project.connections.filter((c) => {
    const src = blocks.find((b) => b.id === c.sourceBlockId);
    const tgt = blocks.find((b) => b.id === c.targetBlockId);
    return src && tgt && src.category !== tgt.category;
  }).length;

  const rationalesText = blocks.map((b) => b.rationale.trim());
  const filled = rationalesText.filter((r) => r.length > 0);
  const shortCount = filled.filter((r) => r.length < 30).length;
  const avgLength = filled.length > 0
    ? Math.round(filled.reduce((sum, r) => sum + r.length, 0) / filled.length)
    : 0;

  return {
    projectTitle: project.projectTitle,
    date: new Date().toLocaleDateString(),
    totalBlocks: blocks.length,
    categoryCoverage,
    totalConnections: project.connections.length,
    crossCategoryConnections,
    rationaleStats: {
      filled: filled.length,
      empty: blocks.length - filled.length,
      total: blocks.length,
      avgLength,
      shortCount,
    },
    rubric,
    checksPass: checks.filter((c) => c.status === 'complete').length,
    checksWarn: checks.filter((c) => c.status === 'warning' || c.status === 'missing').length,
    checksTotal: checks.length,
    hintsHigh: hints.filter((h) => h.priority === 'high').length,
    hintsMedium: hints.filter((h) => h.priority === 'medium').length,
    hintsLow: hints.filter((h) => h.priority === 'low').length,
  };
}

export function generateAssessmentText(project: Project): string {
  const d = buildAssessmentData(project);
  const checks = runValidation(project);
  const hints = generateHints(project);
  const lines: string[] = [];

  lines.push('═══════════════════════════════════════════════════');
  lines.push('  INSTRUCTOR ASSESSMENT REPORT');
  lines.push('═══════════════════════════════════════════════════');
  lines.push('');
  lines.push(`Project:  ${d.projectTitle}`);
  lines.push(`Date:     ${d.date}`);
  lines.push('');

  // ── Overview ─────────────────────────────────────────────────────────
  lines.push('── OVERVIEW ──────────────────────────────────────');
  lines.push(`Blocks:       ${d.totalBlocks}`);
  lines.push(`Connections:  ${d.totalConnections} (${d.crossCategoryConnections} cross-stage)`);
  lines.push(`Categories:   ${d.categoryCoverage.filter((c) => c.filled).length}/${d.categoryCoverage.length} filled`);
  lines.push('');

  // Category breakdown
  lines.push('  Category Breakdown:');
  for (const cat of d.categoryCoverage) {
    const status = cat.filled ? `✓ ${cat.count} block(s)` : '✗ empty';
    lines.push(`    ${cat.category.padEnd(24)} ${status}`);
  }
  lines.push('');

  // ── Rubric Score ─────────────────────────────────────────────────────
  lines.push('── RUBRIC SCORE ──────────────────────────────────');
  lines.push(`Score:  ${d.rubric.totalScore}/${d.rubric.maxScore} points`);
  lines.push('');
  for (const dim of d.rubric.dimensions) {
    const bar = '█'.repeat(Math.round((dim.score / dim.maxScore) * 20)).padEnd(20, '░');
    lines.push(`  ${dim.label.padEnd(22)} ${bar} ${dim.score}/${dim.maxScore}`);
    lines.push(`    ${dim.feedback}`);
  }
  lines.push('');

  // ── Rationale Quality ────────────────────────────────────────────────
  lines.push('── RATIONALE QUALITY ─────────────────────────────');
  if (d.rationaleStats.total === 0) {
    lines.push('  No blocks to evaluate.');
  } else {
    const pct = Math.round((d.rationaleStats.filled / d.rationaleStats.total) * 100);
    lines.push(`  Completion:  ${d.rationaleStats.filled}/${d.rationaleStats.total} blocks have rationale (${pct}%)`);
    lines.push(`  Avg length:  ${d.rationaleStats.avgLength} characters`);
    if (d.rationaleStats.empty > 0) {
      lines.push(`  ⚠ ${d.rationaleStats.empty} block(s) have no rationale`);
    }
    if (d.rationaleStats.shortCount > 0) {
      lines.push(`  ⚠ ${d.rationaleStats.shortCount} rationale(s) are very short (<30 chars)`);
    }

    // List blocks missing rationale
    const missing = project.blocks.filter((b) => !b.rationale.trim());
    if (missing.length > 0 && missing.length <= 10) {
      lines.push('  Missing rationale:');
      for (const b of missing) {
        lines.push(`    - ${b.label} (${b.category})`);
      }
    }
  }
  lines.push('');

  // ── Validation Checks ────────────────────────────────────────────────
  lines.push('── VALIDATION CHECKS ─────────────────────────────');
  lines.push(`  Passed: ${d.checksPass}  |  Warnings: ${d.checksWarn}  |  Total: ${d.checksTotal}`);
  lines.push('');
  for (const c of checks) {
    const icon = c.status === 'complete' ? '✓' : c.status === 'warning' ? '⚠' : '✗';
    lines.push(`  ${icon} ${c.label}: ${c.message}`);
  }
  lines.push('');

  // ── Contextual Hints ─────────────────────────────────────────────────
  lines.push('── CONTEXTUAL HINTS ──────────────────────────────');
  lines.push(`  High: ${d.hintsHigh}  |  Medium: ${d.hintsMedium}  |  Low: ${d.hintsLow}`);
  if (hints.length === 0) {
    lines.push('  No hints triggered — design looks solid.');
  } else {
    lines.push('');
    for (const h of hints) {
      const icon = h.priority === 'high' ? '🔴' : h.priority === 'medium' ? '🟡' : '🟢';
      lines.push(`  ${icon} ${h.message}`);
      lines.push(`    → ${h.suggestion}`);
    }
  }
  lines.push('');

  lines.push('═══════════════════════════════════════════════════');
  lines.push('  Generated by ML Project Design Studio');
  lines.push('═══════════════════════════════════════════════════');

  return lines.join('\n');
}
