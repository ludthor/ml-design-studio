import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Block, Connection, Project, CategoryId, UIState } from '../types';

// ─── State ───────────────────────────────────────────────────────────────────

interface AppState {
  project: Project;
  ui: UIState;
  isDirty: boolean;
  lastSavedAt: string | null;
  undoStack: Project[];
}

const STORAGE_KEY = 'ml-design-studio-project';

function createEmptyProject(): Project {
  return {
    projectId: uuidv4(),
    projectTitle: 'Untitled Project',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    blocks: [],
    connections: [],
  };
}

const defaultUI: UIState = {
  selectedBlockId: null,
  connectionSource: null,
  searchQuery: '',
  showHelp: false,
  showExport: false,
  showSummary: false,
  showValidation: false,
  showResetConfirm: false,
  showMobileSidebar: false,
  showMobileInspector: false,
  showGlossary: false,
  mobileSelectorCategory: null,
};

function loadFromStorage(): Project | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Project;
  } catch {
    return null;
  }
}

function saveToStorage(project: Project) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

function getInitialState(): AppState {
  const saved = loadFromStorage();
  return {
    project: saved ?? createEmptyProject(),
    ui: defaultUI,
    isDirty: false,
    lastSavedAt: saved ? new Date().toISOString() : null,
    undoStack: [],
  };
}

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_PROJECT_TITLE'; title: string }
  | { type: 'ADD_BLOCK'; block: Block }
  | { type: 'UPDATE_BLOCK'; id: string; updates: Partial<Block> }
  | { type: 'DELETE_BLOCK'; id: string }
  | { type: 'DUPLICATE_BLOCK'; id: string }
  | { type: 'MOVE_BLOCK'; id: string; toCategory: CategoryId; toIndex: number }
  | { type: 'REORDER_BLOCKS'; category: CategoryId; orderedIds: string[] }
  | { type: 'ADD_CONNECTION'; sourceBlockId: string; targetBlockId: string }
  | { type: 'DELETE_CONNECTION'; id: string }
  | { type: 'SELECT_BLOCK'; id: string | null }
  | { type: 'SET_CONNECTION_SOURCE'; id: string | null }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'TOGGLE_UI'; key: keyof Omit<UIState, 'selectedBlockId' | 'connectionSource' | 'searchQuery' | 'mobileSelectorCategory'>; value?: boolean }
  | { type: 'SET_MOBILE_SELECTOR'; category: CategoryId | null }
  | { type: 'SAVE' }
  | { type: 'RESET' }
  | { type: 'LOAD_PROJECT'; project: Project }
  | { type: 'DELETE_SELECTED' }
  | { type: 'UNDO' };

function reducer(state: AppState, action: Action): AppState {
  const MAX_UNDO = 30;

  const pushUndo = (): Project[] => {
    const stack = [...state.undoStack, state.project];
    return stack.length > MAX_UNDO ? stack.slice(stack.length - MAX_UNDO) : stack;
  };

  const touchProject = (project: Partial<Project>): AppState => ({
    ...state,
    project: {
      ...state.project,
      ...project,
      updatedAt: new Date().toISOString(),
    },
    isDirty: true,
    undoStack: pushUndo(),
  });

  switch (action.type) {
    case 'SET_PROJECT_TITLE':
      return touchProject({ projectTitle: action.title });

    case 'ADD_BLOCK':
      return touchProject({ blocks: [...state.project.blocks, action.block] });

    case 'UPDATE_BLOCK':
      return touchProject({
        blocks: state.project.blocks.map((b) =>
          b.id === action.id ? { ...b, ...action.updates } : b
        ),
      });

    case 'DELETE_BLOCK': {
      return {
        ...touchProject({
          blocks: state.project.blocks.filter((b) => b.id !== action.id),
          connections: state.project.connections.filter(
            (c) => c.sourceBlockId !== action.id && c.targetBlockId !== action.id
          ),
        }),
        ui: {
          ...state.ui,
          selectedBlockId:
            state.ui.selectedBlockId === action.id
              ? null
              : state.ui.selectedBlockId,
          connectionSource:
            state.ui.connectionSource === action.id
              ? null
              : state.ui.connectionSource,
        },
      };
    }

    case 'DUPLICATE_BLOCK': {
      const source = state.project.blocks.find((b) => b.id === action.id);
      if (!source) return state;
      const newBlock: Block = {
        ...source,
        id: uuidv4(),
        label: `${source.label} (copy)`,
        sortIndex:
          Math.max(
            ...state.project.blocks
              .filter((b) => b.category === source.category)
              .map((b) => b.sortIndex),
            0
          ) + 1,
      };
      return touchProject({ blocks: [...state.project.blocks, newBlock] });
    }

    case 'MOVE_BLOCK': {
      const blocks = state.project.blocks.map((b) => {
        if (b.id === action.id) {
          return { ...b, category: action.toCategory, sortIndex: action.toIndex };
        }
        return b;
      });
      return touchProject({ blocks });
    }

    case 'REORDER_BLOCKS': {
      const blocks = state.project.blocks.map((b) => {
        if (b.category === action.category) {
          const idx = action.orderedIds.indexOf(b.id);
          if (idx !== -1) return { ...b, sortIndex: idx };
        }
        return b;
      });
      return touchProject({ blocks });
    }

    case 'ADD_CONNECTION': {
      if (action.sourceBlockId === action.targetBlockId) return state;
      const exists = state.project.connections.some(
        (c) =>
          c.sourceBlockId === action.sourceBlockId &&
          c.targetBlockId === action.targetBlockId
      );
      if (exists) return state;
      const conn: Connection = {
        id: uuidv4(),
        sourceBlockId: action.sourceBlockId,
        targetBlockId: action.targetBlockId,
      };
      return {
        ...touchProject({
          connections: [...state.project.connections, conn],
        }),
        ui: { ...state.ui, connectionSource: null },
      };
    }

    case 'DELETE_CONNECTION':
      return touchProject({
        connections: state.project.connections.filter((c) => c.id !== action.id),
      });

    case 'SELECT_BLOCK':
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedBlockId: action.id,
        },
      };

    case 'SET_CONNECTION_SOURCE':
      return { ...state, ui: { ...state.ui, connectionSource: action.id } };

    case 'SET_SEARCH_QUERY':
      return { ...state, ui: { ...state.ui, searchQuery: action.query } };

    case 'SET_MOBILE_SELECTOR':
      return { ...state, ui: { ...state.ui, mobileSelectorCategory: action.category } };

    case 'TOGGLE_UI': {
      const currentVal = state.ui[action.key];
      return {
        ...state,
        ui: {
          ...state.ui,
          [action.key]: action.value !== undefined ? action.value : !currentVal,
        },
      };
    }

    case 'SAVE': {
      saveToStorage(state.project);
      return { ...state, isDirty: false, lastSavedAt: new Date().toISOString() };
    }

    case 'RESET': {
      const fresh = createEmptyProject();
      saveToStorage(fresh);
      return {
        project: fresh,
        ui: defaultUI,
        isDirty: false,
        lastSavedAt: new Date().toISOString(),
        undoStack: [],
      };
    }

    case 'LOAD_PROJECT':
      return {
        project: action.project,
        ui: defaultUI,
        isDirty: false,
        lastSavedAt: new Date().toISOString(),
        undoStack: [],
      };

    case 'DELETE_SELECTED': {
      if (!state.ui.selectedBlockId) return state;
      return reducer(state, { type: 'DELETE_BLOCK', id: state.ui.selectedBlockId });
    }

    case 'UNDO': {
      if (state.undoStack.length === 0) return state;
      const previous = state.undoStack[state.undoStack.length - 1];
      return {
        ...state,
        project: previous,
        undoStack: state.undoStack.slice(0, -1),
        isDirty: true,
        ui: { ...state.ui, selectedBlockId: null, connectionSource: null },
      };
    }

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface ProjectContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  addBlock: (label: string, category: CategoryId, isCustom?: boolean, description?: string) => void;
  getBlocksForCategory: (category: CategoryId) => Block[];
  getSelectedBlock: () => Block | null;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Autosave on changes (debounced 1s)
  useEffect(() => {
    if (state.isDirty) {
      if (autosaveTimer.current !== null) clearTimeout(autosaveTimer.current);
      autosaveTimer.current = setTimeout(() => {
        dispatch({ type: 'SAVE' });
      }, 1000);
    }
    return () => {
      if (autosaveTimer.current !== null) clearTimeout(autosaveTimer.current);
    };
  }, [state.isDirty, state.project]);

  const addBlock = useCallback(
    (label: string, category: CategoryId, isCustom = false, description = '') => {
      const categoryBlocks = state.project.blocks.filter((b) => b.category === category);
      const maxIndex = categoryBlocks.length > 0
        ? Math.max(...categoryBlocks.map((b) => b.sortIndex))
        : -1;
      const block: Block = {
        id: uuidv4(),
        category,
        label,
        description,
        rationale: '',
        tags: [],
        isCustom,
        sortIndex: maxIndex + 1,
        styleVariant: 'default',
      };
      dispatch({ type: 'ADD_BLOCK', block });
    },
    [state.project.blocks]
  );

  const getBlocksForCategory = useCallback(
    (category: CategoryId) =>
      state.project.blocks
        .filter((b) => b.category === category)
        .sort((a, b) => a.sortIndex - b.sortIndex),
    [state.project.blocks]
  );

  const getSelectedBlock = useCallback(
    () =>
      state.project.blocks.find((b) => b.id === state.ui.selectedBlockId) ?? null,
    [state.project.blocks, state.ui.selectedBlockId]
  );

  return (
    <ProjectContext.Provider
      value={{ state, dispatch, addBlock, getBlocksForCategory, getSelectedBlock }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used inside <ProjectProvider>');
  return ctx;
}
