import { useProject } from '../context/ProjectContext';
import { X } from 'lucide-react';

export default function HelpModal() {
  const { state, dispatch } = useProject();

  if (!state.ui.showHelp) return null;

  const close = () =>
    dispatch({ type: 'TOGGLE_UI', key: 'showHelp', value: false });

  return (
    <div
      className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 modal-backdrop"
      onClick={close}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-800">
            How to use ML Project Design Studio
          </h2>
          <button
            onClick={close}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm text-slate-600">
          <Section title="1. Set your project title">
            Click the title in the top bar and type your project name.
          </Section>
          <Section title="2. Add blocks to the canvas">
            Browse or search the block library on the left. Drag any block into a
            category panel on the canvas. You can also create custom blocks using
            the "+ Create custom block" button.
          </Section>
          <Section title="3. Edit blocks">
            Click on any block on the canvas to open the Inspector panel on the
            right. There you can edit the label, description, rationale, and tags.
          </Section>
          <Section title="4. Connect blocks">
            Hover over a block to see connection anchors (small dots on left/right
            edges). Click an anchor on the source block, then click an anchor on
            the target block. A directed arrow will appear. Hover over the arrow
            to see a delete button.
          </Section>
          <Section title="5. Check your design">
            Click the "Checks" button in the top bar to see the Design Checks
            panel. It highlights missing components and incomplete rationale.
          </Section>
          <Section title="6. Generate a summary">
            Click "Summary" to see a structured overview of your entire design,
            ready to copy.
          </Section>
          <Section title="7. Export your work">
            Click "Export" to download your project as JSON, PNG, text summary,
            or a full PDF report.
          </Section>
          <Section title="Keyboard shortcuts">
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs">
              <li>
                <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[10px] font-mono">
                  Delete
                </kbd>{' '}
                / <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[10px] font-mono">
                  Backspace
                </kbd>{' '}
                — delete selected block
              </li>
              <li>
                <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[10px] font-mono">
                  Escape
                </kbd>{' '}
                — deselect block / cancel connection / close modal
              </li>
            </ul>
          </Section>
          <Section title="Persistence">
            Your work is automatically saved to your browser's local storage every
            second. It will be restored when you refresh the page. Use the Save
            button to save immediately.
          </Section>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-blue-50 via-violet-50 to-amber-50 rounded-lg">
              <p className="text-[11px] text-slate-500 leading-relaxed text-center">
                Crafted by{' '}
                <strong className="text-slate-700">
                  Ariel Ortiz-Beltrán PhD
                </strong>{' '}
                powered by{' '}
                <strong className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Claude Opus 4.6
                </strong>
                <br />
                <a
                  href="https://opensource.org/licenses/MIT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-400 hover:text-blue-600 underline"
                >
                  MIT License
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-800 mb-1">{title}</h3>
      <div className="text-xs text-slate-500 leading-relaxed">{children}</div>
    </div>
  );
}
