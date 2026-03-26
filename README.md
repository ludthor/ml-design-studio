# ML Project Design Studio

An interactive educational tool for visually designing Machine Learning project pipelines. Students drag, connect, and annotate blocks across a structured 8-category pipeline — from problem framing to deployment — building a clear, assessable project blueprint with built-in rubric scoring, contextual feedback, and exportable reports.

![License: CC-BY 4.0](https://img.shields.io/badge/License-CC--BY%204.0-blue.svg)

## Goals

- **Learn by designing** — students architect ML systems visually, making design decisions explicit and justifiable
- **Structured thinking** — the 8-stage pipeline enforces a logical progression from problem definition through deployment to risk analysis
- **Immediate feedback** — 14 automated checks, 24 contextual hints, and rubric scoring guide students toward complete, coherent designs
- **Assessment-ready** — instructors can review designs via a detailed assessment report with rubric breakdowns and rationale quality analysis

## Features

### Core Design Tools

- **8-Category Pipeline** — Problem Framing → Data Sources → Preprocessing → Modeling → Training & Optimization → Evaluation → Output & Deployment → Risks & Constraints
- **121 Predefined Blocks** — each with educational descriptions, organized across the 8 pipeline stages
- **Custom Blocks** — create blocks with arbitrary labels in any category
- **Drag & Drop** — drag blocks from the library into category panels; move blocks between categories
- **Visual Connections** — click anchors on blocks to draw directed Bézier arrows showing data/logic flow; connected blocks highlight when selected
- **Pipeline Flow Diagram** — category-level flow visualization showing connection density between pipeline stages, with expected-flow ghost edges, isolated-stage warnings, and interactive node filtering
- **Inspector Panel** — edit labels, descriptions, rationale, tags, and style variants per block, with inline glossary insights
- **Block Duplication** — clone any block with one click

### Intelligence & Feedback

- **14 Validation Checks** — flag missing pipeline stages, incomplete rationale, architectural inconsistencies (e.g., model without data, training without model)
- **24 Contextual Hints** — detect architecture mismatches (CNN without images), metric mismatches (classification without classification metrics), pipeline gaps (no train/val/test split), generative AI risks (hallucination, no adaptation strategy), and critical-thinking gaps (no risks addressed)
- **Rubric Scoring** — 100-point scale across 4 dimensions: Pipeline Coverage (25), Design Depth (25), Pipeline Coherence (25), Critical Thinking (25)

### Educational Resources

- **Glossary** — 62 searchable ML terms with definitions, key insights, common pitfalls, and cross-referenced related concepts; integrated into the Inspector panel for in-context learning
- **5 Starter Templates** — pre-built pipelines (Image Classification, Sentiment Analysis, Recommendation System, Demand Forecasting, Fraud Detection) with rationale and connections, spanning beginner to advanced difficulty
- **Welcome Overlay** — onboarding guide with drag/click/connect instructions for first-time users
- **Help Modal** — 7-step how-to guide with keyboard shortcuts and persistence info

### Assessment & Export

- **Assessment Report** — 4-tab instructor report (Overview, Rubric, Rationale Quality, Checks) with coverage grids and visual score bars; copy to clipboard or download as `.txt`
- **Project Summary** — structured overview by category with blocks, tags, rationale, and connections; copy to clipboard
- **Export Formats** — JSON (save/restore), PNG screenshot, PDF report with title page, plain-text summary
- **Import** — load previously exported JSON projects with validation

### Workflow

- **Undo** — 30-level undo stack (`Ctrl/Cmd+Z`)
- **Auto-Save** — debounced persistence to `localStorage` every second, with save status indicator
- **Progress Pill** — 8-dot toolbar indicator showing which pipeline categories are populated

### Mobile & Responsive

- **Responsive Grid** — single column (mobile) → 2 columns (tablet) → 4×2 grid (desktop)
- **Mobile Block Selector** — bottom sheet with search and custom block form
- **Mobile Connection Pills** — tap-friendly connection indicators replacing SVG arrows on small screens
- **Mobile Quick Actions** — Edit/Copy/Delete buttons on selected blocks
- **Safe Area Support** — handles iOS notch/home-bar insets

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript (strict) |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Connections | Custom SVG renderer (Bézier curves) |
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
├── types.ts                       # Core type definitions
├── data/
│   ├── categories.ts              # 8 pipeline categories with colors & descriptions
│   ├── blockLibrary.ts            # 121 block templates with descriptions
│   ├── glossary.ts                # 62 ML terms with definitions & insights
│   └── starterTemplates.ts        # 5 pre-built project templates
├── context/
│   └── ProjectContext.tsx          # Global state (useReducer + localStorage)
├── components/
│   ├── AppShell.tsx                # Root layout (sidebar + canvas + inspector)
│   ├── TopBar.tsx                  # Title, progress pill, actions toolbar
│   ├── SidebarLibrary.tsx          # Searchable block library with custom block form
│   ├── CategoryCanvas.tsx          # Main canvas with responsive grid
│   ├── CategoryPanel.tsx           # Individual category drop zones
│   ├── DesignBlock.tsx             # Draggable block with connection anchors
│   ├── ConnectionLayer.tsx         # SVG Bézier arrow renderer
│   ├── FlowDiagramModal.tsx        # Category-level pipeline flow diagram
│   ├── InspectorPanel.tsx          # Block editor with glossary integration
│   ├── ValidationPanel.tsx         # Score, checks & tips (3-tab panel)
│   ├── SummaryModal.tsx            # Visual project summary
│   ├── ExportModal.tsx             # Export/import dialog
│   ├── AssessmentReportModal.tsx   # 4-tab instructor assessment report
│   ├── GlossaryModal.tsx           # Searchable split-pane glossary
│   ├── TemplateGallery.tsx         # Starter template picker
│   ├── HelpModal.tsx               # Usage guide
│   ├── MobileBlockSelector.tsx     # Mobile bottom-sheet block picker
│   └── ConfirmDialog.tsx           # Reusable confirmation dialog
└── utils/
    ├── exportUtils.ts              # PNG & PDF generation
    ├── importUtils.ts              # JSON import with validation
    ├── validationRules.ts          # 14 design validation checks
    ├── contextualHints.ts          # 24 intelligent contextual hints
    ├── rubricScoring.ts            # 4-dimension rubric (100 pts)
    ├── assessmentReport.ts         # Assessment report text generation
    └── generateSummary.ts          # Plain-text summary generator
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

