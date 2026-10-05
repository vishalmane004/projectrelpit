import React from 'react';

interface OutputPanelProps {
  logs: string[];
  activeFileName: string;
  isRunning?: boolean;
  activeTab: 'console' | 'preview';
  onTabChange: (tab: 'console' | 'preview') => void;
  previewDoc: string;
  previewKey: number;
  onRun: () => void;
  onClear: () => void;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  logs,
  activeFileName,
  isRunning = false,
  activeTab,
  onTabChange,
  previewDoc,
  previewKey,
  onRun,
  onClear,
}) => {
  const getLogStyle = (log: string) => {
    if (log === 'Loading Python...') {
      return 'border-amber-500/60 text-amber-300 bg-amber-950/20';
    }
    if (
      log.startsWith('Traceback') ||
      log.includes('Error:') ||
      log.includes('Exception:') ||
      log.startsWith('Error')
    ) {
      return 'border-rose-500/70 text-rose-300 bg-rose-950/20';
    }
    return 'border-emerald-500/40 text-slate-200 bg-slate-900/40';
  };

  return (
    <aside className="w-[350px] min-w-[350px] max-w-[350px] h-full bg-slate-900 border-l border-slate-800 flex flex-col">
      {/* Header with Toggle & Run */}
      <div className="h-10 px-3 border-b border-slate-800 flex items-center justify-between bg-slate-900 select-none gap-2">
        {/* Toggle between Console and Preview */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => onTabChange('console')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              activeTab === 'console'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Console
          </button>
          <button
            type="button"
            onClick={() => onTabChange('preview')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              activeTab === 'preview'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Preview
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {activeTab === 'console' && logs.length > 0 && !isRunning && (
            <button
              type="button"
              onClick={onClear}
              className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded hover:bg-slate-800 transition-colors"
              title="Clear console"
            >
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={onRun}
            disabled={isRunning}
            className={`flex items-center gap-1.5 text-white font-medium text-xs px-3 py-1.5 rounded-md shadow-sm transition-colors ${
              isRunning
                ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 cursor-pointer'
            }`}
          >
            {isRunning ? (
              <>
                <svg className="animate-spin w-3 h-3 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Running...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-3 h-3 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Run</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'console' ? (
        <>
          {/* Console output display */}
          <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-slate-300 space-y-1.5 bg-slate-950/60 select-text">
            {logs.length === 0 ? (
              <div className="text-slate-600 italic select-none py-2">
                Click &quot;Run&quot; to execute {activeFileName}...
              </div>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`leading-relaxed border-l-2 pl-2.5 py-1 rounded-r whitespace-pre-wrap break-words ${getLogStyle(log)}`}
                >
                  {log}
                </div>
              ))
            )}
          </div>

          {/* Console footer status */}
          <div className="p-2.5 border-t border-slate-800/80 bg-slate-900/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Target: <span className="font-mono text-slate-400">{activeFileName}</span></span>
            <span>{logs.length} {logs.length === 1 ? 'output' : 'outputs'}</span>
          </div>
        </>
      ) : (
        /* Preview Tab View */
        <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
          {previewDoc ? (
            <iframe
              key={previewKey}
              title="Web Preview"
              srcDoc={previewDoc}
              sandbox="allow-scripts allow-modals allow-forms"
              className="w-full h-full border-0 bg-white"
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500 select-none">
              <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-slate-400 mb-3 text-lg">
                🌐
              </div>
              <p className="text-sm font-medium text-slate-300">No preview yet</p>
              <p className="text-xs text-slate-500 mt-1.5 max-w-[220px] leading-relaxed">
                Click &quot;Run&quot; on an HTML file or when editing CSS/JS to launch the live preview.
              </p>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
