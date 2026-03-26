import type { Project, Block, Connection, CategoryId } from '../types';

const VALID_CATEGORIES: CategoryId[] = [
  'problem-framing', 'data-sources', 'preprocessing', 'modeling',
  'training-optimization', 'evaluation', 'output-deployment', 'risks-constraints',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_BLOCKS = 500;
const MAX_CONNECTIONS = 2000;
const MAX_STRING_LENGTH = 10_000;

function sanitizeString(value: unknown, maxLen = MAX_STRING_LENGTH): string {
  if (typeof value !== 'string') return '';
  return value.slice(0, maxLen);
}

function validateBlock(raw: unknown): Block | null {
  if (raw == null || typeof raw !== 'object') return null;
  const b = raw as Record<string, unknown>;
  if (typeof b.id !== 'string' || !b.id) return null;
  if (!VALID_CATEGORIES.includes(b.category as CategoryId)) return null;
  if (typeof b.label !== 'string' || !b.label.trim()) return null;

  return {
    id: sanitizeString(b.id, 100),
    category: b.category as CategoryId,
    label: sanitizeString(b.label, 200),
    description: sanitizeString(b.description),
    rationale: sanitizeString(b.rationale),
    tags: Array.isArray(b.tags)
      ? b.tags.filter((t): t is string => typeof t === 'string').map(t => t.slice(0, 100)).slice(0, 50)
      : [],
    isCustom: typeof b.isCustom === 'boolean' ? b.isCustom : false,
    sortIndex: typeof b.sortIndex === 'number' && Number.isFinite(b.sortIndex) ? b.sortIndex : 0,
    styleVariant:
      b.styleVariant === 'highlight' || b.styleVariant === 'subtle'
        ? b.styleVariant
        : 'default',
  };
}

function validateConnection(raw: unknown, blockIds: Set<string>): Connection | null {
  if (raw == null || typeof raw !== 'object') return null;
  const c = raw as Record<string, unknown>;
  if (typeof c.id !== 'string' || !c.id) return null;
  if (typeof c.sourceBlockId !== 'string' || !blockIds.has(c.sourceBlockId)) return null;
  if (typeof c.targetBlockId !== 'string' || !blockIds.has(c.targetBlockId)) return null;
  if (c.sourceBlockId === c.targetBlockId) return null;
  return {
    id: c.id,
    sourceBlockId: c.sourceBlockId,
    targetBlockId: c.targetBlockId,
  };
}

export function validateProject(data: unknown): Project {
  if (data == null || typeof data !== 'object') {
    throw new Error('Invalid project file format');
  }
  const d = data as Record<string, unknown>;

  if (typeof d.projectId !== 'string' || !d.projectId) throw new Error('Missing or invalid projectId');
  if (typeof d.projectTitle !== 'string' || !d.projectTitle) throw new Error('Missing or invalid projectTitle');
  if (!Array.isArray(d.blocks)) throw new Error('Missing blocks array');
  if (!Array.isArray(d.connections)) throw new Error('Missing connections array');
  if (d.blocks.length > MAX_BLOCKS) throw new Error(`Too many blocks (max ${MAX_BLOCKS})`);
  if (d.connections.length > MAX_CONNECTIONS) throw new Error(`Too many connections (max ${MAX_CONNECTIONS})`);

  const blocks: Block[] = [];
  for (const raw of d.blocks) {
    const block = validateBlock(raw);
    if (block) blocks.push(block);
  }

  if (blocks.length === 0 && d.blocks.length > 0) {
    throw new Error('No valid blocks found in file');
  }

  const blockIds = new Set(blocks.map((b) => b.id));
  const connections: Connection[] = [];
  for (const raw of d.connections) {
    const conn = validateConnection(raw, blockIds);
    if (conn) connections.push(conn);
  }

  return {
    projectId: sanitizeString(d.projectId, 100),
    projectTitle: sanitizeString(d.projectTitle, 200),
    createdAt: typeof d.createdAt === 'string' ? sanitizeString(d.createdAt, 50) : new Date().toISOString(),
    updatedAt: typeof d.updatedAt === 'string' ? sanitizeString(d.updatedAt, 50) : new Date().toISOString(),
    blocks,
    connections,
  };
}

export function importJSON(file: File): Promise<Project> {
  if (file.size > MAX_FILE_SIZE) {
    return Promise.reject(new Error(`File too large (max ${MAX_FILE_SIZE / 1024 / 1024} MB)`));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          reject(new Error('Failed to read file'));
          return;
        }
        const data = JSON.parse(text);
        resolve(validateProject(data));
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
