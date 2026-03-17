import { useProject } from '../context/ProjectContext';
import { runValidation } from '../utils/validationRules';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export default function ValidationPanel() {
  const { state } = useProject();

  if (!state.ui.showValidation) return null;

  const checks = runValidation(state.project);

  const icons = {
    complete: <CheckCircle2 size={14} className="text-green-500 shrink-0" />,
    warning: <AlertTriangle size={14} className="text-amber-500 shrink-0" />,
    missing: <XCircle size={14} className="text-red-400 shrink-0" />,
  };

  const statusOrder = { missing: 0, warning: 1, complete: 2 };
  const sorted = [...checks].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status]
  );

  const completeCount = checks.filter((c) => c.status === 'complete').length;

  return (
    <div className="border-t border-slate-200 bg-white">
      <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Design Checks
        </h3>
        <span className="text-[10px] text-slate-400">
          {completeCount}/{checks.length} passed
        </span>
      </div>
      <div className="max-h-[200px] overflow-y-auto">
        {sorted.map((check) => (
          <div
            key={check.id}
            className="flex items-start gap-2 px-3 py-2 border-b border-slate-50 last:border-b-0"
          >
            {icons[check.status]}
            <div className="min-w-0">
              <p className="text-xs text-slate-700 font-medium">{check.label}</p>
              <p className="text-[10px] text-slate-400">{check.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
