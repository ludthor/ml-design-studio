export type CategoryId =
  | 'problem-framing'
  | 'data-sources'
  | 'preprocessing'
  | 'modeling'
  | 'training-optimization'
  | 'evaluation'
  | 'output-deployment'
  | 'risks-constraints';

export interface Block {
  id: string;
  category: CategoryId;
  label: string;
  description: string;
  rationale: string;
  tags: string[];
  isCustom: boolean;
  sortIndex: number;
  styleVariant: 'default' | 'highlight' | 'subtle';
}

export interface Connection {
  id: string;
  sourceBlockId: string;
  targetBlockId: string;
}

export interface Project {
  projectId: string;
  projectTitle: string;
  createdAt: string;
  updatedAt: string;
  blocks: Block[];
  connections: Connection[];
}

export interface UIState {
  selectedBlockId: string | null;
  connectionSource: string | null;
  searchQuery: string;
  showHelp: boolean;
  showExport: boolean;
  showSummary: boolean;
  showValidation: boolean;
  showResetConfirm: boolean;
  showMobileSidebar: boolean;
  showMobileInspector: boolean;
  showGlossary: boolean;
  showTemplates: boolean;
  showAssessment: boolean;
  mobileSelectorCategory: CategoryId | null;
}

export interface CategoryDef {
  id: CategoryId;
  label: string;
  description: string;
  step: number;
  color: string;
  bgColor: string;
  borderColor: string;
  lightBg: string;
  row: number;
  col: number;
}

export interface BlockTemplate {
  label: string;
  category: CategoryId;
  description: string;
}

export type ValidationStatus = 'complete' | 'warning' | 'missing';

export interface ValidationCheck {
  id: string;
  label: string;
  status: ValidationStatus;
  message: string;
}

// ─── Rubric ──────────────────────────────────────────────────────────────────

export interface RubricDimension {
  id: string;
  label: string;
  score: number;
  maxScore: number;
  feedback: string;
}

export interface RubricResult {
  dimensions: RubricDimension[];
  totalScore: number;
  maxScore: number;
  grade: string;
  gradeLabel: string;
}

// ─── Contextual Hints ────────────────────────────────────────────────────────

export type HintPriority = 'high' | 'medium' | 'low';

export interface ContextualHint {
  id: string;
  priority: HintPriority;
  message: string;
  suggestion?: string;
}

// ─── Glossary ────────────────────────────────────────────────────────────────

export interface GlossaryEntry {
  term: string;
  definition: string;
  keyInsight: string;
  pitfalls?: string;
  related?: string[];
}
