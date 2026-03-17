import { useRef, useState } from 'react';
import { useProject } from '../context/ProjectContext';
import {
  exportJSON,
  exportSummaryText,
  downloadPNG,
  exportPDF,
} from '../utils/exportUtils';
import { importJSON } from '../utils/importUtils';
import {
  X,
  FileJson,
  FileText,
  Image,
  FileDown,
  Loader2,
  Upload,
} from 'lucide-react';

export default function ExportModal() {
  const { state, dispatch } = useProject();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!state.ui.showExport) return null;

  const close = () =>
    dispatch({ type: 'TOGGLE_UI', key: 'showExport', value: false });

  const getCanvas = () => document.getElementById('design-canvas');

  const handleExport = async (type: string) => {
    setLoading(type);
    setError(null);
    try {
      switch (type) {
        case 'json':
          exportJSON(state.project);
          break;
        case 'text':
          exportSummaryText(state.project);
          break;
        case 'png': {
          const el = getCanvas();
          if (el) await downloadPNG(el, state.project.projectTitle);
          break;
        }
        case 'pdf': {
          const el = getCanvas();
          if (el) await exportPDF(el, state.project);
          break;
        }
      }
    } catch (err) {
      console.error('Export failed:', err);
      setError('Export failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const project = await importJSON(file);
      dispatch({ type: 'LOAD_PROJECT', project });
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    }
    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const options = [
    {
      type: 'json',
      icon: <FileJson size={20} />,
      label: 'JSON',
      desc: 'Full project data — can be re-imported later',
    },
    {
      type: 'text',
      icon: <FileText size={20} />,
      label: 'Summary (TXT)',
      desc: 'Readable project summary in plain text',
    },
    {
      type: 'png',
      icon: <Image size={20} />,
      label: 'Canvas (PNG)',
      desc: 'Screenshot of the current canvas',
    },
    {
      type: 'pdf',
      icon: <FileDown size={20} />,
      label: 'Full Report (PDF)',
      desc: 'Title, canvas image, and summary in one document',
    },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 modal-backdrop"
      onClick={close}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-800">Export Project</h2>
          <button
            onClick={close}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-2">
          {options.map((opt) => (
            <button
              key={opt.type}
              onClick={() => handleExport(opt.type)}
              disabled={loading !== null}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors cursor-pointer disabled:opacity-50 text-left"
            >
              <div className="text-slate-400">
                {loading === opt.type ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  opt.icon
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">{opt.label}</p>
                <p className="text-xs text-slate-400">{opt.desc}</p>
              </div>
            </button>
          ))}

          {/* Divider */}
          <div className="border-t border-slate-200 pt-2 mt-2">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">
              Import
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-dashed border-slate-300 hover:border-blue-300 hover:bg-blue-50/50 transition-colors cursor-pointer text-left"
            >
              <div className="text-slate-400">
                <Upload size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Load Project (JSON)</p>
                <p className="text-xs text-slate-400">
                  Import a previously exported project file
                </p>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 mt-2">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
