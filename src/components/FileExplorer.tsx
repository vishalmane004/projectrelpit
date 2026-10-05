import React from 'react';
import type { ProjectFile } from '../types';

interface FileExplorerProps {
  files: ProjectFile[];
  activeFileName: string;
  onSelectFile: (fileName: string) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFileName,
  onSelectFile,
}) => {
  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.js')) {
      return (
        <span className="text-yellow-400 font-bold font-mono text-xs px-1 py-0.5 rounded bg-yellow-400/10 border border-yellow-400/20">
          JS
        </span>
      );
    }
    if (fileName.endsWith('.py')) {
      return (
        <span className="text-blue-400 font-bold font-mono text-xs px-1 py-0.5 rounded bg-blue-400/10 border border-blue-400/20">
          PY
        </span>
      );
    }
    if (fileName.endsWith('.css')) {
      return (
        <span className="text-sky-400 font-bold font-mono text-xs px-1 py-0.5 rounded bg-sky-400/10 border border-sky-400/20">
          CSS
        </span>
      );
    }
    if (fileName.endsWith('.html')) {
      return (
        <span className="text-orange-400 font-bold font-mono text-xs px-1 py-0.5 rounded bg-orange-400/10 border border-orange-400/20">
          HTML
        </span>
      );
    }
    return (
      <span className="text-slate-400 font-bold font-mono text-xs px-1 py-0.5 rounded bg-slate-400/10 border border-slate-400/20">
        TXT
      </span>
    );
  };

  return (
    <aside className="w-[250px] min-w-[250px] max-w-[250px] h-full bg-slate-900 border-r border-slate-800 flex flex-col select-none">
      <div className="h-10 px-4 border-b border-slate-800 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
          Files
        </span>
        <span className="text-[10px] text-slate-500 font-mono">
          {files.length} items
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1" aria-label="Project files">
        {files.map((file) => {
          const isActive = file.name === activeFileName;
          return (
            <button
              key={file.name}
              type="button"
              onClick={() => onSelectFile(file.name)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left ${
                isActive
                  ? 'bg-slate-800 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="flex-shrink-0 flex items-center justify-center w-6">
                {getFileIcon(file.name)}
              </div>
              <span className="truncate font-mono text-xs">{file.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800/80 bg-slate-900/60">
        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Workspace Ready</span>
        </div>
      </div>
    </aside>
  );
};
