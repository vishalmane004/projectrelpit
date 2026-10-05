import React from 'react';
import Editor from '@monaco-editor/react';
import type { ProjectFile } from '../types';

interface EditorPanelProps {
  activeFile: ProjectFile;
  onContentChange: (newContent: string) => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  activeFile,
  onContentChange,
}) => {
  return (
    <main className="flex-1 h-full min-w-0 flex flex-col bg-slate-950 overflow-hidden">
      {/* Editor Tab Header */}
      <div className="h-10 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-t border-t-2 border-indigo-500 text-xs font-mono text-slate-200">
            <span>{activeFile.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500 uppercase px-2 py-0.5 rounded bg-slate-800 border border-slate-700/50">
            {activeFile.language}
          </span>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 w-full h-full relative">
        <Editor
          height="100%"
          path={activeFile.name}
          language={activeFile.language}
          value={activeFile.content}
          theme="vs-dark"
          onChange={(val) => onContentChange(val ?? '')}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Menlo', 'Consolas', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            padding: { top: 12, bottom: 12 },
          }}
          loading={
            <div className="flex items-center justify-center h-full text-slate-500 text-sm font-mono">
              Loading editor...
            </div>
          }
        />
      </div>
    </main>
  );
};
