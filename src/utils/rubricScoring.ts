import type { Project, RubricResult, RubricDimension } from '../types';
import { CATEGORIES } from '../data/categories';

export function computeRubric(project: Project): RubricResult {
  const dims: RubricDimension[] = [];
  const blocks = project.blocks;
  const totalBlocks = blocks.length;

  // ── 1. Pipeline Coverage (0–25) ──────────────────────────────────────────
  const filledCats = CATEGORIES.filter((c) =>
    blocks.some((b) => b.category === c.id)
  );
  const coverageScore = Math.round((filledCats.length / CATEGORIES.length) * 25);
  const missingCats = CATEGORIES.filter(
    (c) => !blocks.some((b) => b.category === c.id)
  );
  dims.push({
    id: 'coverage',
    label: 'Pipeline Coverage',
    score: coverageScore,
    maxScore: 25,
    feedback:
      filledCats.length === 8
        ? 'All 8 pipeline stages addressed — comprehensive design'
        : `${filledCats.length}/8 stages covered. Missing: ${missingCats.map((c) => c.label).join(', ')}`,
  });

  // ── 2. Design Depth (0–25) ───────────────────────────────────────────────
  if (totalBlocks === 0) {
    dims.push({
      id: 'depth',
      label: 'Design Depth',
      score: 0,
      maxScore: 25,
      feedback: 'Add blocks to start building your design',
    });
  } else {
    const withRationale = blocks.filter((b) => b.rationale.trim()).length;
    const withTags = blocks.filter((b) => b.tags.length > 0).length;
    const withDesc = blocks.filter((b) => b.description.trim()).length;
    const rationaleRatio = withRationale / totalBlocks;
    const descRatio = withDesc / totalBlocks;
    const tagsRatio = withTags / totalBlocks;
    // Weight: rationale 50%, description 30%, tags 20%
    const depthScore = Math.round(
      (rationaleRatio * 0.5 + descRatio * 0.3 + tagsRatio * 0.2) * 25
    );
    const missing: string[] = [];
    if (rationaleRatio < 1)
      missing.push(`${totalBlocks - withRationale} block(s) lack rationale`);
    if (descRatio < 1)
      missing.push(`${totalBlocks - withDesc} block(s) lack description`);
    if (tagsRatio < 0.5) missing.push('most blocks have no tags');
    dims.push({
      id: 'depth',
      label: 'Design Depth',
      score: depthScore,
      maxScore: 25,
      feedback:
        depthScore >= 22
          ? 'Excellent documentation across all blocks'
          : missing.join('; ') || 'Good depth overall',
    });
  }

  // ── 3. Pipeline Coherence (0–25) ─────────────────────────────────────────
  const connCount = project.connections.length;
  if (totalBlocks <= 1) {
    dims.push({
      id: 'coherence',
      label: 'Pipeline Coherence',
      score: 0,
      maxScore: 25,
      feedback: 'Add blocks and connect them to show data flow',
    });
  } else {
    const crossCategoryConns = project.connections.filter((c) => {
      const src = blocks.find((b) => b.id === c.sourceBlockId);
      const tgt = blocks.find((b) => b.id === c.targetBlockId);
      return src && tgt && src.category !== tgt.category;
    }).length;
    const connScore = Math.min(
      25,
      Math.round(
        (Math.min(connCount, 10) / 10) * 12 +
          (Math.min(crossCategoryConns, 6) / 6) * 13
      )
    );
    dims.push({
      id: 'coherence',
      label: 'Pipeline Coherence',
      score: connScore,
      maxScore: 25,
      feedback:
        connCount === 0
          ? 'No connections — link blocks to show how data flows through your pipeline'
          : crossCategoryConns === 0
            ? `${connCount} connection(s) but all within the same category — connect across pipeline stages`
            : `${connCount} connection(s) with ${crossCategoryConns} cross-stage link(s) showing data flow`,
    });
  }

  // ── 4. Critical Thinking (0–25) ──────────────────────────────────────────
  const hasRisks = blocks.some((b) => b.category === 'risks-constraints');
  const hasFairness = blocks.some(
    (b) =>
      b.category === 'risks-constraints' &&
      (b.label.toLowerCase().includes('fairness') ||
        b.label.toLowerCase().includes('bias'))
  );
  const evalCount = blocks.filter((b) => b.category === 'evaluation').length;
  const hasBaseline = blocks.some(
    (b) =>
      b.label.toLowerCase().includes('baseline') && b.category === 'modeling'
  );
  const hasErrorAnalysis = blocks.some(
    (b) =>
      (b.label.toLowerCase().includes('error analysis') ||
        b.label.toLowerCase().includes('robustness')) &&
      b.category === 'evaluation'
  );

  let critScore = 0;
  const critFeedback: string[] = [];
  if (hasRisks) {
    critScore += 7;
  } else {
    critFeedback.push('Address risks and constraints');
  }
  if (hasFairness) {
    critScore += 4;
  } else if (hasRisks) {
    critFeedback.push('Consider fairness/bias analysis');
  }
  if (evalCount >= 3) {
    critScore += 6;
  } else if (evalCount >= 1) {
    critScore += 3;
    critFeedback.push('Add more evaluation metrics for rigor');
  } else {
    critFeedback.push('Add evaluation metrics');
  }
  if (hasBaseline) {
    critScore += 4;
  } else if (blocks.some((b) => b.category === 'modeling')) {
    critFeedback.push('Add a baseline model for comparison');
  }
  if (hasErrorAnalysis) {
    critScore += 4;
  } else if (evalCount > 0) {
    critFeedback.push('Consider error analysis or robustness checks');
  }

  dims.push({
    id: 'critical-thinking',
    label: 'Critical Thinking',
    score: Math.min(25, critScore),
    maxScore: 25,
    feedback:
      critFeedback.length === 0
        ? 'Strong critical analysis with risks, baselines, and diverse evaluation'
        : critFeedback.join('; '),
  });

  // ── Aggregate ────────────────────────────────────────────────────────────
  const totalScore = dims.reduce((sum, d) => sum + d.score, 0);
  const maxScore = dims.reduce((sum, d) => sum + d.maxScore, 0);

  return { dimensions: dims, totalScore, maxScore };
}
