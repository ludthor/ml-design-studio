import TopBar from './TopBar';
import SidebarLibrary from './SidebarLibrary';
import CategoryCanvas from './CategoryCanvas';
import InspectorPanel from './InspectorPanel';
import ValidationPanel from './ValidationPanel';
import SummaryModal from './SummaryModal';
import ExportModal from './ExportModal';
import HelpModal from './HelpModal';
import ConfirmDialog from './ConfirmDialog';
import MobileBlockSelector from './MobileBlockSelector';
import GlossaryModal from './GlossaryModal';
import TemplateGallery from './TemplateGallery';
import { useProject } from '../context/ProjectContext';

export default function AppShell() {
  const { state, dispatch } = useProject();

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop sidebar — always visible on md+ */}
        <div className="hidden md:flex">
          <SidebarLibrary />
        </div>

        {/* Mobile sidebar overlay */}
        {state.ui.showMobileSidebar && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => dispatch({ type: 'TOGGLE_UI', key: 'showMobileSidebar', value: false })}
            />
            <div className="relative z-10 w-[280px] max-w-[80vw] h-full animate-slide-in-left">
              <SidebarLibrary />
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <CategoryCanvas />
          <ValidationPanel />
        </div>

        {/* Desktop inspector — always visible on lg+ */}
        <div className="hidden lg:flex">
          <InspectorPanel />
        </div>

        {/* Mobile/tablet inspector overlay */}
        {state.ui.showMobileInspector && state.ui.selectedBlockId && (
          <div className="lg:hidden fixed inset-0 z-40 flex items-end">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => dispatch({ type: 'TOGGLE_UI', key: 'showMobileInspector', value: false })}
            />
            <div className="relative z-10 w-full max-h-[70vh] overflow-hidden animate-slide-in-bottom">
              <InspectorPanel mobile />
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <SummaryModal />
      <ExportModal />
      <HelpModal />
      <GlossaryModal />
      <TemplateGallery />
      <MobileBlockSelector />

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
