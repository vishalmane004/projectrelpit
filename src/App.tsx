import { useState, useEffect } from 'react';
import { FileExplorer } from './components/FileExplorer';
import { EditorPanel } from './components/EditorPanel';
import { OutputPanel } from './components/OutputPanel';
import { usePyodide } from './hooks/usePyodide';
import { useJsRunner } from './hooks/useJsRunner';
import { buildPreviewDocument } from './lib/previewBuilder';
import type { ProjectFile } from './types';

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
  const [files, setFiles] = useState<ProjectFile[]>(INITIAL_FILES);
  const [activeFileName, setActiveFileName] = useState<string>('index.js');
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'console' | 'preview'>('console');
  const [previewDoc, setPreviewDoc] = useState<string>('');
  const [previewKey, setPreviewKey] = useState<number>(0);

  const { runPython, isReady: isPyodideReady } = usePyodide();
  const { runJs } = useJsRunner();

  const activeFile = files.find((f) => f.name === activeFileName) || files[0];

  useEffect(() => {
    const handlePreviewMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PREVIEW_CONSOLE_LOG') {
        setLogs((prev) => [...prev, event.data.message]);
      }
    };
    window.addEventListener('message', handlePreviewMessage);
    return () => window.removeEventListener('message', handlePreviewMessage);
  }, []);

  const handleContentChange = (newContent: string) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.name === activeFileName ? { ...file, content: newContent } : file
      )
    );
  };

  const handleRun = async () => {
    // Clear the output panel before each run
    setLogs([]);

    const hasIndexHtml = files.some((f) => f.name === 'index.html');
    const isHtmlFile = activeFile.name.endsWith('.html');
    const isWebFileWithHtml =
      (activeFile.name.endsWith('.css') || activeFile.name.endsWith('.js')) && hasIndexHtml;

    if (isHtmlFile || isWebFileWithHtml) {
      // Build preview directly from editor state
      const doc = buildPreviewDocument(files, activeFile.name);
      setPreviewDoc(doc);
      setPreviewKey((k) => k + 1);
      setActiveTab('preview');
      return;
    }

    if (activeFile.name.endsWith('.py')) {
      setActiveTab('console');
      setIsRunning(true);

      // Show "Loading Python..." the first time Pyodide initializes
      if (!isPyodideReady) {
        setLogs(['Loading Python...']);
      }

      await runPython(activeFile.content, {
        onOutput: (text) => {
          setLogs((prev) => [...prev, text]);
        },
        onError: (errorText) => {
          setLogs((prev) => [...prev, errorText]);
        },
        onStartLoading: () => {
          setLogs(['Loading Python...']);
        },
      });

      setIsRunning(false);
    } else if (activeFile.name.endsWith('.js')) {
      setActiveTab('console');
      runJs(activeFile.content, {
        onOutput: (text) => {
          setLogs((prev) => [...prev, text]);
        },
        onError: (errorText) => {
          setLogs((prev) => [...prev, errorText]);
        },
      });
    } else {
      setActiveTab('console');
      setLogs([`Running ${activeFileName}...`]);
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 flex">
      {/* Left: File Explorer (250px) */}
      <FileExplorer
        files={files}
        activeFileName={activeFileName}
        onSelectFile={setActiveFileName}
      />

      {/* Center: Monaco Editor (flex-1) */}
      <EditorPanel
        activeFile={activeFile}
        onContentChange={handleContentChange}
      />

      {/* Right: Output Panel (350px) */}
      <OutputPanel
        logs={logs}
        activeFileName={activeFileName}
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
