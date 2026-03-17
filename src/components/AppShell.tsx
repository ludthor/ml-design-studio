import TopBar from './TopBar';
import SidebarLibrary from './SidebarLibrary';
import CategoryCanvas from './CategoryCanvas';
import InspectorPanel from './InspectorPanel';
import ValidationPanel from './ValidationPanel';
import SummaryModal from './SummaryModal';
import ExportModal from './ExportModal';
import HelpModal from './HelpModal';
import ConfirmDialog from './ConfirmDialog';
import { useProject } from '../context/ProjectContext';

export default function AppShell() {
  const { state, dispatch } = useProject();

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar />

      <div className="flex-1 flex overflow-hidden">
        <SidebarLibrary />

        <div className="flex-1 flex flex-col overflow-hidden">
          <CategoryCanvas />
          <ValidationPanel />
        </div>

        <InspectorPanel />
      </div>

      {/* Modals */}
      <SummaryModal />
      <ExportModal />
      <HelpModal />

      {state.ui.showResetConfirm && (
        <ConfirmDialog
          title="Reset Project"
          message="This will delete all blocks, connections, and reset the project title. This action cannot be undone."
          confirmLabel="Reset everything"
          onConfirm={() => {
            dispatch({ type: 'RESET' });
            dispatch({ type: 'TOGGLE_UI', key: 'showResetConfirm', value: false });
          }}
          onCancel={() =>
            dispatch({ type: 'TOGGLE_UI', key: 'showResetConfirm', value: false })
          }
        />
      )}
    </div>
  );
}
