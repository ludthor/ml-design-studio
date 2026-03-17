import type { Project } from '../types';
import { CATEGORIES } from '../data/categories';

export function generateSummary(project: Project): string {
  const lines: string[] = [];

  lines.push(`# ${project.projectTitle}`);
  lines.push('');
  lines.push(`Generated: ${new Date().toLocaleDateString()}`);
  lines.push('');

  for (const cat of CATEGORIES) {
    const blocks = project.blocks
      .filter((b) => b.category === cat.id)
      .sort((a, b) => a.sortIndex - b.sortIndex);

    lines.push(`## ${cat.label}`);
    lines.push('');

    if (blocks.length === 0) {
      lines.push('_No blocks defined._');
    } else {
      for (const block of blocks) {
        lines.push(`- **${block.label}**`);
        if (block.description) {
          lines.push(`  ${block.description}`);
        }
        if (block.rationale) {
          lines.push(`  _Rationale: ${block.rationale}_`);
        }
        if (block.tags.length > 0) {
          lines.push(`  Tags: ${block.tags.join(', ')}`);
        }
      }
    }
    lines.push('');
  }

  // Connections
  if (project.connections.length > 0) {
    lines.push('## Connections');
    lines.push('');
    for (const conn of project.connections) {
      const src = project.blocks.find((b) => b.id === conn.sourceBlockId);
      const tgt = project.blocks.find((b) => b.id === conn.targetBlockId);
      if (src && tgt) {
        lines.push(`- ${src.label} → ${tgt.label}`);
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}
