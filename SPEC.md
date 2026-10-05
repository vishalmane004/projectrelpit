# Project Specification: Replit-Style Online Code Editor

## 1. Overview
A lightweight, browser-based code editing and execution environment inspired by Replit. The application enables users to manage files, write code using Monaco Editor, execute Python (via Pyodide) and JavaScript directly in the browser, authenticate with Supabase, persist projects, and share interactive links.

---

## 2. Technology Stack

- **Build Tool / Framework:** Vite + React (TypeScript)
- **Styling:** Tailwind CSS
- **Code Editor:** Monaco Editor (`@monaco-editor/react`)
- **Runtimes & In-Browser Execution:**
  - Python: Pyodide (WebAssembly)
  - JavaScript: Sandboxed browser runner with intercepted `console` API
- **Backend / Database / Auth:** Supabase (`@supabase/supabase-js`)
- **Hosting & Deployment:** Vercel

> **Strict Dependency Rule:** No external libraries beyond those explicitly requested (Vite, React, TypeScript, Tailwind CSS, `@monaco-editor/react`, Pyodide, `@supabase/supabase-js`) may be added without explicit approval.

---

## 3. Guiding Rules & Principles

1. **Step-by-Step Delivery:** Implement exactly one feature at a time in the prescribed order. Each feature must be tested and verified before starting the next.
2. **Component Modularity:** Every component must reside in its own dedicated file (e.g., `src/components/FileTree/FileTree.tsx`, `src/components/Editor/CodeEditor.tsx`, `src/components/Output/OutputPanel.tsx`). Avoid monolithic files.
3. **No Unrequested Packages:** Rely on standard browser APIs, vanilla Tailwind utilities, and specified packages. Do not install unapproved UI component kits or utility packages.
4. **Current Status:** Specification phase only. No application code is written yet.

---

## 4. Sequential Feature Roadmap

### Feature 1: Three-Panel Layout
- **Goal:** Establish a responsive, structured multi-pane workspace layout.
- **Panels:**
  1. **Left Panel (File Tree):** Explorer sidebar displaying files and folders.
  2. **Center Panel (Editor):** Main editing area hosting the Monaco Editor.
  3. **Right/Bottom Panel (Output Panel):** Execution terminal/console displaying program output and errors.
- **Key Details:**
  - Collapsible/resizable panel layout styled with Tailwind CSS.
  - Header/toolbar area for execution triggers (e.g., "Run" button) and project status.
  - Clean visual separation with a dark modern IDE theme.

### Feature 2: File System Operations
- **Goal:** Provide in-memory project file management.
- **Key Details:**
  - State management for files: file name, extension, language mode, and file contents.
  - Actions:
    - **Create File:** Add new file with name and default content based on extension (`.py`, `.js`, etc.).
    - **Rename File:** In-place or modal file rename with validation.
    - **Delete File:** Delete with confirmation prompt.
    - **Active File Selection:** Clicking a file opens its content in Monaco Editor and switches editor syntax highlighting.
  - Default initial template files (e.g., `main.py` and `index.js`).

### Feature 3: In-Browser Python Execution (Pyodide)
- **Goal:** Run Python code client-side without any server requirement.
- **Key Details:**
  - Load Pyodide via CDN/WebAssembly.
  - Asynchronous initialization with clear visual loading indicator.
  - Execution pipeline:
    - Redirect Python `sys.stdout` and `sys.stderr` to the Output Panel.
    - Support standard output (`print(...)`) and display runtime tracebacks on error.
  - Non-blocking execution state (disable "Run" button while running, show spinner).

### Feature 4: JavaScript Execution & Console Capture
- **Goal:** Safely execute JavaScript in the browser and display outputs.
- **Key Details:**
  - Execution sandbox (isolated evaluation or iframe-based runner).
  - Intercept and capture console methods:
    - `console.log`
    - `console.error`
    - `console.warn`
    - `console.info`
  - Stream logs and runtime exceptions formatted into the Output Panel with appropriate status colors.

### Feature 5: Supabase Authentication & Cloud Persistence
- **Goal:** Enable user accounts and persistent project storage.
- **Key Details:**
  - Supabase client integration.
  - User Authentication:
    - Sign Up, Sign In, and Sign Out (Email/Password or OAuth).
    - Session tracking and authenticated user UI state.
  - Project Persistence:
    - Database schema for `projects` and associated file records.
    - "Save Project" action (manual and auto-save on change).
    - Project management: List user's saved projects, create new project, load existing project into editor.

### Feature 6: Share Links
- **Goal:** Allow users to share code and projects via unique URLs.
- **Key Details:**
  - Generate unique, public shareable URL slug for any saved project.
  - Routing / URL parameter detection to load shared project state on page load.
  - Read-only viewing mode for visitors with a "Fork / Clone to My Projects" option.

### Feature 7: Vercel Deployment Configuration
- **Goal:** Production deployment ready for Vercel.
- **Key Details:**
  - Configure `vercel.json` for Single Page Application (SPA) routing redirects.
  - Environment variable setup for Supabase (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
  - Production build verification (`npm run build`).

---

## 5. Directory Structure Plan

```text
├── public/
├── src/
│   ├── components/
│   │   ├── Editor/
│   │   │   └── CodeEditor.tsx
│   │   ├── FileTree/
│   │   │   ├── FileTree.tsx
│   │   │   └── FileTreeItem.tsx
│   │   ├── Output/
│   │   │   └── OutputPanel.tsx
│   │   ├── Auth/
│   │   │   ├── AuthModal.tsx
│   │   │   └── UserMenu.tsx
│   │   ├── Header/
│   │   │   └── Navbar.tsx
│   │   └── Common/
│   │       └── Modal.tsx
│   ├── hooks/
│   │   ├── usePyodide.ts
│   │   ├── useJsRunner.ts
│   │   └── useProject.ts
│   ├── lib/
│   │   ├── supabaseClient.ts
│   │   └── defaultFiles.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env.example
├── index.html
├── package.json
├── SPEC.md
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 6. Verification & Quality Checklist

- [ ] All components reside in separate, focused files.
- [ ] No unrequested third-party libraries installed.
- [ ] TypeScript strict mode enabled with no type errors.
- [ ] Smooth switching between Python and JavaScript modes.
- [ ] Pyodide loads cleanly with progress indication.
- [ ] Outputs accurately capture stdout, console streams, and execution errors.
- [ ] Supabase data flow properly handles auth status and ownership checks.
- [ ] Share URLs correctly load the shared project snapshot.
