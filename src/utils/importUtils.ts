import type { Project } from '../types';

export function importJSON(file: File): Promise<Project> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          reject(new Error('Failed to read file'));
          return;
        }
        const data = JSON.parse(text) as Project;
        // Basic validation
        if (
          !data.projectId ||
          !data.projectTitle ||
          !Array.isArray(data.blocks) ||
          !Array.isArray(data.connections)
        ) {
          reject(new Error('Invalid project file format'));
          return;
        }
        resolve(data);
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
