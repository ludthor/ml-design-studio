import type { Block, Project, ValidationCheck } from '../types';
import { CATEGORIES, CATEGORY_MAP } from '../data/categories';

export function runValidation(project: Project): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  const blocksByCategory = new Map<string, Block[]>();
  for (const cat of CATEGORIES) {
    blocksByCategory.set(
      cat.id,
      project.blocks.filter((b) => b.category === cat.id)
    );
  }

  const has = (catId: string) => (blocksByCategory.get(catId)?.length ?? 0) > 0;

  // Required categories
  const requiredCategories: { id: string; checkId: string }[] = [
    { id: 'problem-framing', checkId: 'has-problem' },
    { id: 'data-sources', checkId: 'has-data' },
    { id: 'modeling', checkId: 'has-modeling' },
    { id: 'evaluation', checkId: 'has-evaluation' },
    { id: 'risks-constraints', checkId: 'has-risks' },
  ];

  for (const { id, checkId } of requiredCategories) {
    const catLabel = CATEGORY_MAP[id]?.label ?? id;
    if (has(id)) {
      checks.push({
        id: checkId,
        label: catLabel,
        status: 'complete',
        message: `${catLabel} is defined`,
      });
    } else {
      checks.push({
        id: checkId,
        label: catLabel,
        status: 'missing',
        message: `No ${catLabel} blocks — consider adding at least one`,
      });
    }
  }

  // Blocks without rationale
  const blocksNoRationale = project.blocks.filter(
    (b) => !b.rationale.trim()
  );
  if (blocksNoRationale.length === 0 && project.blocks.length > 0) {
    checks.push({
      id: 'rationale-coverage',
      label: 'Rationale coverage',
      status: 'complete',
      message: 'All blocks have rationale',
    });
  } else if (blocksNoRationale.length > 0) {
    checks.push({
      id: 'rationale-coverage',
      label: 'Rationale coverage',
      status: 'warning',
      message: `${blocksNoRationale.length} block(s) have no rationale`,
    });
  }

  // Output exists but no Evaluation
  if (has('output-deployment') && !has('evaluation')) {
    checks.push({
      id: 'output-no-eval',
      label: 'Output without Evaluation',
      status: 'warning',
      message: 'Output defined but no Evaluation — how will you measure quality?',
    });
  }

  // Modeling exists but no Data Sources
  if (has('modeling') && !has('data-sources')) {
    checks.push({
      id: 'model-no-data',
      label: 'Model without Data',
      status: 'warning',
      message: 'Model defined but no Data Sources — what will it learn from?',
    });
  }

  // Training exists but no Modeling
  if (has('training-optimization') && !has('modeling')) {
    checks.push({
      id: 'training-no-model',
      label: 'Training without Model',
      status: 'warning',
      message: 'Training defined but no Model — what are you training?',
    });
  }

  // ── New checks ──────────────────────────────────────────────────────────

  // Preprocessing but no data sources
  if (has('preprocessing') && !has('data-sources')) {
    checks.push({
      id: 'preprocess-no-data',
      label: 'Preprocessing without Data',
      status: 'warning',
      message: 'Preprocessing defined but no Data Sources — what are you cleaning?',
    });
  }

  // Model but no training/optimization
  if (has('modeling') && !has('training-optimization')) {
    checks.push({
      id: 'model-no-training',
      label: 'Model without Training',
      status: 'warning',
      message: 'Model defined but no Training strategy — how will it learn?',
    });
  }

  // Connections check
  if (project.blocks.length >= 3 && project.connections.length === 0) {
    checks.push({
      id: 'no-connections',
      label: 'No connections',
      status: 'warning',
      message: 'No connections between blocks — link them to show data flow',
    });
  } else if (project.connections.length > 0) {
    checks.push({
      id: 'has-connections',
      label: 'Block connections',
      status: 'complete',
      message: `${project.connections.length} connection(s) defined`,
    });
  }

  // Data split for modeling
  const labels = new Set(project.blocks.map((b) => b.label.toLowerCase()));
  if (has('modeling') && has('data-sources') && !labels.has('train/validation/test split')) {
    checks.push({
      id: 'no-data-split',
      label: 'Data split missing',
      status: 'warning',
      message: 'No Train/Validation/Test split — essential for honest evaluation',
    });
  }

  // Evaluation diversity
  const evalBlocks = blocksByCategory.get('evaluation') ?? [];
  if (evalBlocks.length === 1) {
    checks.push({
      id: 'single-metric',
      label: 'Single metric',
      status: 'warning',
      message: 'Only one evaluation metric — consider multiple perspectives on model quality',
    });
  } else if (evalBlocks.length >= 3) {
    checks.push({
      id: 'diverse-eval',
      label: 'Evaluation diversity',
      status: 'complete',
      message: `${evalBlocks.length} evaluation methods — thorough assessment`,
    });
  }

  return checks;
}
