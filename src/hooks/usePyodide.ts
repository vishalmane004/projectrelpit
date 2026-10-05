import { useRef, useState, useCallback } from 'react';

declare global {
  interface Window {
    loadPyodide?: (options?: {
      indexURL?: string;
      stdout?: (text: string) => void;
      stderr?: (text: string) => void;
    }) => Promise<any>;
  }
}

const PYODIDE_VERSION = 'v0.27.2';
const SCRIPT_URL = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/pyodide.js`;
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`;

let globalPyodidePromise: Promise<any> | null = null;
let globalPyodideInstance: any = null;

function loadPyodideScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.loadPyodide) {
      resolve();
      return;
    }

    const existingScript = document.querySelector(`script[src="${SCRIPT_URL}"]`) as HTMLScriptElement | null;
    if (existingScript) {
      if (existingScript.dataset.loaded === 'true') {
        resolve();
      } else {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', (e) => reject(new Error(`Failed to load Pyodide CDN: ${e}`)));
      }
      return;
    }

    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = (e) => reject(new Error(`Failed to load Pyodide script from CDN: ${e}`));
    document.head.appendChild(script);
  });
}

export function usePyodide() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(globalPyodideInstance !== null);
  const isRunningRef = useRef<boolean>(false);

  const getPyodide = useCallback(async (onStartLoading?: () => void) => {
    if (globalPyodideInstance) {
      return globalPyodideInstance;
    }

    if (!globalPyodidePromise) {
      if (onStartLoading) {
        onStartLoading();
      }
      setIsLoading(true);

      globalPyodidePromise = (async () => {
        await loadPyodideScript();
        if (!window.loadPyodide) {
          throw new Error('Pyodide script loaded, but window.loadPyodide was not found.');
        }
        const pyodide = await window.loadPyodide({
          indexURL: INDEX_URL,
        });
        globalPyodideInstance = pyodide;
        return pyodide;
      })();
    } else if (onStartLoading) {
      onStartLoading();
    }

    try {
      const pyodide = await globalPyodidePromise;
      setIsReady(true);
      setIsLoading(false);
      return pyodide;
    } catch (err) {
      globalPyodidePromise = null;
      setIsLoading(false);
      throw err;
    }
  }, []);

  const runPython = useCallback(
    async (
      code: string,
      callbacks: {
        onOutput: (text: string) => void;
        onError: (text: string) => void;
        onStartLoading?: () => void;
      }
    ) => {
      if (isRunningRef.current) return;
      isRunningRef.current = true;

      try {
        const pyodide = await getPyodide(callbacks.onStartLoading);

        pyodide.setStdout({
          batched: (text: string) => {
            callbacks.onOutput(text);
          },
        });

        pyodide.setStderr({
          batched: (text: string) => {
            callbacks.onError(text);
          },
        });

        await pyodide.runPythonAsync(code);
      } catch (err: any) {
        const errorMsg = err?.message || String(err);
        callbacks.onError(errorMsg);
      } finally {
        isRunningRef.current = false;
      }
    },
    [getPyodide]
  );

  return {
    runPython,
    isLoading,
    isReady: globalPyodideInstance !== null || isReady,
  };
}
