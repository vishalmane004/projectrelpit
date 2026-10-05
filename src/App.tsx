import { useState, useEffect, useRef, useCallback } from 'react';
import { FileExplorer } from './components/FileExplorer';
import { EditorPanel } from './components/EditorPanel';
import { OutputPanel } from './components/OutputPanel';
import { usePyodide } from './hooks/usePyodide';
import { useJsRunner } from './hooks/useJsRunner';
import { buildPreviewDocument } from './lib/previewBuilder';
import { languageFromExtension } from './lib/languageFromExtension';
import { TEMPLATES } from './lib/templates';
import type { ProjectFile } from './types';

const STORAGE_KEY_FILES = 'replit_files';
const STORAGE_KEY_ACTIVE_FILE = 'replit_active_file';

const INITIAL_FILES: ProjectFile[] = [
  {
    name: 'index.js',
    language: 'javascript',
    content: `// JavaScript source file\nconsole.log("Hello from index.js!");\n`,
  },
  {
    name: 'main.py',
    language: 'python',
    content: `# Python source file\nprint("Hello from main.py!")\n`,
  },
  {
    name: 'style.css',
    language: 'css',
    content: `/* CSS stylesheet */\nbody {\n  margin: 0;\n  background-color: #0f172a;\n  color: #f8fafc;\n}\n`,
  },
  {
    name: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>\n<html>\n  <head>\n    <link rel="stylesheet" href="style.css">\n  </head>\n  <body>\n    <h1>Hello</h1>\n    <button>Click me</button>\n    <script src="index.js"></script>\n  </body>\n</html>\n`,
  },
];

export default function App() {
  const [files, setFiles] = useState<ProjectFile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FILES);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load files from localStorage', e);
    }
    return INITIAL_FILES;
  });

  const [activeFileName, setActiveFileName] = useState<string>(() => {
    try {
      const savedFiles = localStorage.getItem(STORAGE_KEY_FILES);
      const savedActive = localStorage.getItem(STORAGE_KEY_ACTIVE_FILE);
      if (savedFiles !== null) {
        const parsed = JSON.parse(savedFiles);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (savedActive && parsed.some((f: ProjectFile) => f.name === savedActive)) {
            return savedActive;
          }
          return parsed[0].name;
        }
      }
    } catch {
      // fallback
    }
    return 'index.js';
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'console' | 'preview'>('console');
  const [previewDoc, setPreviewDoc] = useState<string>('');
  const [previewKey, setPreviewKey] = useState<number>(0);

  const { runPython, isReady: isPyodideReady } = usePyodide();
  const { runJs } = useJsRunner();

  const activeFile =
    files.find((f) => f.name === activeFileName) ?? files[0] ?? null;

  // Auto-save files to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(files));
    } catch (e) {
      console.error('Failed to save files to localStorage', e);
    }
  }, [files]);

  useEffect(() => {
    try {
      if (activeFileName) {
        localStorage.setItem(STORAGE_KEY_ACTIVE_FILE, activeFileName);
      }
    } catch (e) {
      console.error('Failed to save active file to localStorage', e);
    }
  }, [activeFileName]);

  // ---------- Preview console bridge ----------
  useEffect(() => {
    const handlePreviewMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PREVIEW_CONSOLE_LOG') {
        setLogs((prev) => [...prev, event.data.message]);
      }
    };
    window.addEventListener('message', handlePreviewMessage);
    return () => window.removeEventListener('message', handlePreviewMessage);
  }, []);

  // ---------- Content change ----------
  const handleContentChange = (newContent: string) => {
    setFiles((prev) =>
      prev.map((file) =>
        file.name === activeFileName ? { ...file, content: newContent } : file
      )
    );
  };

  // ---------- File management ----------
  const handleCreateFile = (name: string) => {
    const newFile: ProjectFile = {
      name,
      language: languageFromExtension(name),
      content: '',
    };
    setFiles((prev) => [...prev, newFile]);
    setActiveFileName(name);
  };

  const handleRenameFile = (oldName: string, newName: string) => {
    setFiles((prev) =>
      prev.map((file) =>
        file.name === oldName
          ? { ...file, name: newName, language: languageFromExtension(newName) }
          : file
      )
    );
    if (activeFileName === oldName) {
      setActiveFileName(newName);
    }
  };

  const handleDeleteFile = (name: string) => {
    setFiles((prev) => {
      const remaining = prev.filter((f) => f.name !== name);
      if (activeFileName === name) {
        // Open the first remaining file, or clear selection
        setActiveFileName(remaining[0]?.name ?? '');
      }
      return remaining;
    });
  };

  const handleLoadTemplate = (templateIndex: number) => {
    const selectedTemplate = TEMPLATES[templateIndex];
    if (!selectedTemplate) return;
    setFiles(selectedTemplate.files);
    setActiveFileName(selectedTemplate.defaultActive);
    setLogs([]);
    setPreviewDoc('');
  };

  // ---------- Run ----------
  const handleRun = useCallback(async () => {
    if (!activeFile) return;
    setLogs([]);

    const hasIndexHtml = files.some((f) => f.name === 'index.html');
    const isHtmlFile = activeFile.name.endsWith('.html');
    const isWebFileWithHtml =
      (activeFile.name.endsWith('.css') || activeFile.name.endsWith('.js')) &&
      hasIndexHtml;

    if (isHtmlFile || isWebFileWithHtml) {
      const doc = buildPreviewDocument(files, activeFile.name);
      setPreviewDoc(doc);
      setPreviewKey((k) => k + 1);
      setActiveTab('preview');
      return;
    }

    if (activeFile.name.endsWith('.py')) {
      setActiveTab('console');
      setIsRunning(true);
      if (!isPyodideReady) {
        setLogs(['Loading Python...']);
      }
      await runPython(activeFile.content, {
        onOutput: (text) => setLogs((prev) => [...prev, text]),
        onError: (errorText) => setLogs((prev) => [...prev, errorText]),
        onStartLoading: () => setLogs(['Loading Python...']),
      });
      setIsRunning(false);
    } else if (activeFile.name.endsWith('.js')) {
      setActiveTab('console');
      runJs(activeFile.content, {
        onOutput: (text) => setLogs((prev) => [...prev, text]),
        onError: (errorText) => setLogs((prev) => [...prev, errorText]),
      });
    } else {
      setActiveTab('console');
      setLogs([`Running ${activeFile.name}...`]);
    }
  }, [activeFile, files, isPyodideReady, runPython, runJs]);

  const handleRunRef = useRef(handleRun);
  useEffect(() => {
    handleRunRef.current = handleRun;
  }, [handleRun]);

  // Global Ctrl+Enter / Cmd+Enter shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunRef.current();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClearLogs = () => setLogs([]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 flex">
      {/* Left: File Explorer (250px) */}
      <FileExplorer
        files={files}
        activeFileName={activeFileName}
        onSelectFile={setActiveFileName}
        onCreateFile={handleCreateFile}
        onRenameFile={handleRenameFile}
        onDeleteFile={handleDeleteFile}
        onLoadTemplate={handleLoadTemplate}
      />

      {/* Center: Monaco Editor (flex-1) */}
      {activeFile ? (
        <EditorPanel
          activeFile={activeFile}
          onContentChange={handleContentChange}
          onRunShortcut={handleRun}
        />
      ) : (
        <main className="flex-1 flex items-center justify-center bg-slate-950 text-slate-600 text-sm select-none">
          No files open — create a new file to start.
        </main>
      )}

      {/* Right: Output Panel (350px) */}
      <OutputPanel
        logs={logs}
        activeFileName={activeFile?.name ?? ''}
        isRunning={isRunning}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        previewDoc={previewDoc}
        previewKey={previewKey}
        onRun={handleRun}
        onClear={handleClearLogs}
      />
    </div>
  );
}
