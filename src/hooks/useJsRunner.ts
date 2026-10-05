import { useRef, useCallback, useEffect } from 'react';

export function useJsRunner() {
  const currentIframeRef = useRef<HTMLIFrameElement | null>(null);
  const currentListenerRef = useRef<((event: MessageEvent) => void) | null>(null);

  const cleanup = useCallback(() => {
    if (currentListenerRef.current) {
      window.removeEventListener('message', currentListenerRef.current);
      currentListenerRef.current = null;
    }
    if (currentIframeRef.current) {
      currentIframeRef.current.remove();
      currentIframeRef.current = null;
    }
  }, []);

  const runJs = useCallback(
    (
      code: string,
      callbacks: {
        onOutput: (text: string) => void;
        onError: (text: string) => void;
      }
    ) => {
      cleanup();

      const runId = 'run_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);

      // Encode user code to base64 safely supporting Unicode
      const bytes = new TextEncoder().encode(code);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const encodedCode = btoa(binary);

      const handleMessage = (event: MessageEvent) => {
        if (
          event.data &&
          event.data.runId === runId &&
          event.data.type === 'JS_RUNNER_LOG'
        ) {
          if (event.data.level === 'error') {
            callbacks.onError(event.data.message);
          } else {
            callbacks.onOutput(event.data.message);
          }
        }
      };

      currentListenerRef.current = handleMessage;
      window.addEventListener('message', handleMessage);

      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.sandbox = 'allow-scripts';

      const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>
<script>
(function() {
  var runId = "${runId}";

  function send(level, text) {
    try {
      window.parent.postMessage({
        runId: runId,
        type: 'JS_RUNNER_LOG',
        level: level,
        message: text
      }, '*');
    } catch(e) {}
  }

  function formatValue(v) {
    if (v === null) return 'null';
    if (v === undefined) return 'undefined';
    if (typeof v === 'string') return v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (typeof v === 'function') return v.toString();
    if (v instanceof Error) return v.stack || (v.name + ': ' + v.message);
    try {
      return JSON.stringify(v, null, 2);
    } catch (e) {
      return String(v);
    }
  }

  function formatArgs(args) {
    return args.map(formatValue).join(' ');
  }

  console.log = function() {
    send('log', formatArgs(Array.prototype.slice.call(arguments)));
  };
  console.info = function() {
    send('info', formatArgs(Array.prototype.slice.call(arguments)));
  };
  console.warn = function() {
    send('warn', formatArgs(Array.prototype.slice.call(arguments)));
  };
  console.error = function() {
    send('error', formatArgs(Array.prototype.slice.call(arguments)));
  };

  window.addEventListener('error', function(event) {
    var msg = event.error ? (event.error.stack || (event.error.name + ': ' + event.error.message)) : (event.message || 'Error occurred');
    send('error', msg);
  });

  window.addEventListener('unhandledrejection', function(event) {
    var reason = event.reason;
    var msg = reason ? (reason.stack || (reason.name ? (reason.name + ': ' + reason.message) : String(reason))) : 'Unhandled Promise Rejection';
    send('error', msg);
  });

  try {
    var binary = atob("${encodedCode}");
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    var code = new TextDecoder().decode(bytes);
    (0, eval)(code);
  } catch (err) {
    var errorMsg = err ? (err.stack || (err.name + ': ' + err.message)) : String(err);
    send('error', errorMsg);
  }
})();
<\/script>
</body>
</html>`;

      iframe.srcdoc = html;
      currentIframeRef.current = iframe;
      document.body.appendChild(iframe);
    },
    [cleanup]
  );

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return { runJs, cleanup };
}
