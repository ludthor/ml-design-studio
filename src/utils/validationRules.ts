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

  return checks;
}
