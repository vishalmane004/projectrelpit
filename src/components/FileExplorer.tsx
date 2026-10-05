import React, { useState } from 'react';
import type { ProjectFile } from '../types';
import { TEMPLATES } from '../lib/templates';

interface FileExplorerProps {
  files: ProjectFile[];
  activeFileName: string;
  onSelectFile: (fileName: string) => void;
  onCreateFile: (name: string) => void;
  onRenameFile: (oldName: string, newName: string) => void;
  onDeleteFile: (name: string) => void;
  onLoadTemplate: (templateIndex: number) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFileName,
  onSelectFile,
  onCreateFile,
  onRenameFile,
  onDeleteFile,
  onLoadTemplate,
}) => {
  const [templateSelect, setTemplateSelect] = useState<string>('');
  const existingNames = files.map((f) => f.name);

  const handleNewFile = () => {
    const name = window.prompt('File name (e.g. test.py):')?.trim();
    if (!name) return;
    if (existingNames.includes(name)) {
      window.alert(`A file named "${name}" already exists.`);
      return;
    }
    onCreateFile(name);
  };

  const handleRename = (e: React.MouseEvent, oldName: string) => {
    e.stopPropagation();
    const newName = window.prompt('New file name:', oldName)?.trim();
    if (!newName || newName === oldName) return;
    if (existingNames.includes(newName)) {
      window.alert(`A file named "${newName}" already exists.`);
      return;
    }
    onRenameFile(oldName, newName);
  };

  const handleDelete = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${name}"?`)) return;
    onDeleteFile(name);
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value, 10);
    setTemplateSelect('');
    if (isNaN(idx)) return;
    if (!window.confirm('Replace current files?')) return;
    onLoadTemplate(idx);
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.js'))
      return (
        <span className="text-yellow-400 font-bold font-mono text-xs px-1 py-0.5 rounded bg-yellow-400/10 border border-yellow-400/20">
          JS
        </span>
      );
    if (fileName.endsWith('.py'))
      return (
        <span className="text-blue-400 font-bold font-mono text-xs px-1 py-0.5 rounded bg-blue-400/10 border border-blue-400/20">
          PY
        </span>
      );
    if (fileName.endsWith('.css'))
      return (
        <span className="text-sky-400 font-bold font-mono text-xs px-1 py-0.5 rounded bg-sky-400/10 border border-sky-400/20">
          CSS
        </span>
      );
    if (fileName.endsWith('.html'))
      return (
        <span className="text-orange-400 font-bold font-mono text-xs px-1 py-0.5 rounded bg-orange-400/10 border border-orange-400/20">
          HTML
        </span>
      );
    return (
      <span className="text-slate-400 font-bold font-mono text-xs px-1 py-0.5 rounded bg-slate-400/10 border border-slate-400/20">
        TXT
      </span>
    );
  };

  return (
    <aside className="w-[250px] min-w-[250px] max-w-[250px] h-full bg-slate-900 border-r border-slate-800 flex flex-col select-none">
      {/* Files header + New file */}
      <div className="h-10 px-3 border-b border-slate-800 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
          Files
        </span>
        <button
          type="button"
          onClick={handleNewFile}
          title="New file"
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white hover:bg-slate-700 px-2 py-1 rounded transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New file
        </button>
      </div>

      {/* New project dropdown */}
      <div className="px-3 py-2 border-b border-slate-800 bg-slate-950/40">
        <select
          value={templateSelect}
          onChange={handleTemplateChange}
          className="w-full text-[11px] bg-slate-800 border border-slate-700 text-slate-300 rounded px-2 py-1.5 cursor-pointer hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-colors appearance-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
        >
          <option value="">✦ New project…</option>
          {TEMPLATES.map((tpl, idx) => (
            <option key={idx} value={idx}>
              {tpl.label}
            </option>
          ))}
        </select>
      </div>

      {/* File list */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5" aria-label="Project files">
        {files.length === 0 && (
          <div className="text-slate-600 italic text-xs px-3 py-4 text-center">
            No files yet. Click "New file" to start.
          </div>
        )}
        {files.map((file) => {
          const isActive = file.name === activeFileName;
          return (
            <div
              key={file.name}
              className={`group flex items-center w-full rounded-md transition-colors ${
                isActive
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              {/* File select button */}
              <button
                type="button"
                onClick={() => onSelectFile(file.name)}
                className="flex-1 flex items-center gap-2 px-3 py-2 text-left min-w-0"
              >
                <div className="flex-shrink-0 flex items-center justify-center w-6">
                  {getFileIcon(file.name)}
                </div>
                <span className="truncate font-mono text-xs">{file.name}</span>
              </button>

              {/* Rename & Delete — shown on hover or when active */}
              <div
                className={`flex-shrink-0 flex items-center pr-1.5 gap-0.5 transition-opacity ${
                  isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                <button
                  type="button"
                  onClick={(e) => handleRename(e, file.name)}
                  title={`Rename ${file.name}`}
                  className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDelete(e, file.name)}
                  title={`Delete ${file.name}`}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/60">
        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{files.length} {files.length === 1 ? 'file' : 'files'} · auto-saved</span>
        </div>
      </div>
    </aside>
  );
};
