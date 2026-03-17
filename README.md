# ML Project Design Studio

A guided visual design tool for building the conceptual architecture of Machine Learning and Neural Network projects. Students can drag, connect, and annotate blocks across a structured 8-category pipeline — from problem framing to deployment — producing a clear, exportable project blueprint.

![License: CC-BY 4.0](https://img.shields.io/badge/License-CC--BY%204.0-blue.svg)

## Features

- **8-Category Pipeline** — Problem Framing → Data Sources → Preprocessing → Modeling → Training & Optimization → Evaluation → Output & Deployment → Risks & Constraints
- **120+ Predefined Blocks** — each with educational descriptions to guide students
- **Drag & Drop** — drag blocks from the library into category panels; move blocks between categories
- **Visual Connections** — click anchors on blocks to draw directed arrows showing data/logic flow
- **Inspector Panel** — edit labels, descriptions, rationale, tags, and style variants per block
- **Design Checks** — 9 automated validation rules that flag missing components and incomplete rationale
- **Project Summary** — rich visual overview with copy-to-clipboard (plain text)
- **Export Options** — JSON (save/restore), PNG screenshot, PDF report, plain-text summary
- **Undo** — 30-level undo stack (Ctrl/Cmd+Z)
- **Auto-Save** — debounced persistence to localStorage every second
- **Welcome State** — onboarding overlay and contextual hints for empty panels

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript (strict) |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Connections | Custom SVG renderer (bezier curves) |
| Export | dom-to-image-more + jsPDF |
| Icons | Lucide React |
| IDs | uuid |

## Getting Started

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

> **Note:** `--legacy-peer-deps` is needed due to a peer dependency between `@tailwindcss/vite` and Vite 8.

## Project Structure

```
src/
├── types.ts                    # Core type definitions
├── data/
│   ├── categories.ts           # 8 pipeline categories with colors & descriptions
│   └── blockLibrary.ts         # 120+ block templates with descriptions
├── context/
│   └── ProjectContext.tsx       # Global state (useReducer + localStorage)
├── components/
│   ├── AppShell.tsx             # Root layout
│   ├── TopBar.tsx               # Title, progress, actions toolbar
│   ├── SidebarLibrary.tsx       # Searchable block library
│   ├── CategoryCanvas.tsx       # Main canvas with 4×2 grid
│   ├── CategoryPanel.tsx        # Individual category drop zones
│   ├── DesignBlock.tsx          # Draggable block with connection anchors
│   ├── ConnectionLayer.tsx      # SVG arrow renderer
│   ├── InspectorPanel.tsx       # Block detail editor
│   ├── ValidationPanel.tsx      # Design checks panel
│   ├── SummaryModal.tsx         # Visual project summary
│   ├── ExportModal.tsx          # Export/import dialog
│   ├── HelpModal.tsx            # Usage guide
│   └── ConfirmDialog.tsx        # Reset confirmation
└── utils/
    ├── exportUtils.ts           # PNG & PDF generation
    ├── importUtils.ts           # JSON import with validation
    ├── validationRules.ts       # 9 design validation checks
    └── generateSummary.ts       # Plain-text summary generator
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl/Cmd + Z` | Undo |
| `Delete` / `Backspace` | Delete selected block |
| `Escape` | Deselect / cancel connection / close modal |

## License

This project is licensed under **[CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/)**.

---

Created by **Ariel Ortiz-Beltrán PhD**, powered by **Claude Opus 4.6**.

