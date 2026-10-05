import type { ProjectFile } from '../types';

export function buildPreviewDocument(
  files: ProjectFile[],
  activeFileName?: string
): string {
  // Use index.html if it exists; otherwise if active file is .html, use it; otherwise fallback to any .html file
  const indexHtml = files.find((f) => f.name === 'index.html');
  const activeHtml = activeFileName?.endsWith('.html')
    ? files.find((f) => f.name === activeFileName)
    : undefined;
  const targetHtmlFile = indexHtml || activeHtml || files.find((f) => f.name.endsWith('.html'));

  if (!targetHtmlFile) {
    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Preview</title></head>
<body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; color: #64748b; background: #0f172a;">
  <p>No HTML file found in project.</p>
</body>
</html>`;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(targetHtmlFile.content, 'text/html');

  // 1. Inlining CSS: Replace <link rel="stylesheet" ...> or <link href="*.css" ...>
  const linkElements = Array.from(
    doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"], link[href$=".css"]')
  );
  const inlinedCssNames = new Set<string>();

  linkElements.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    const cleanName = href.replace(/^(\.\/|\/)/, '');
    const matchingCss = files.find((f) => f.name === cleanName);
    if (matchingCss) {
      inlinedCssNames.add(cleanName);
      const styleEl = doc.createElement('style');
      styleEl.setAttribute('data-inlined-from', cleanName);
      styleEl.textContent = matchingCss.content;
      link.parentNode?.replaceChild(styleEl, link);
    }
  });

  // If style.css exists in files and was not explicitly inlined via link tag, append it
  const defaultStyle = files.find((f) => f.name === 'style.css');
  if (defaultStyle && !inlinedCssNames.has('style.css')) {
    const styleEl = doc.createElement('style');
    styleEl.setAttribute('data-inlined-from', 'style.css');
    styleEl.textContent = defaultStyle.content;
    const targetParent = doc.head || doc.body || doc.documentElement;
    targetParent.appendChild(styleEl);
  }

  // 2. Inlining JS: Replace <script src="*.js">
  const scriptElements = Array.from(
    doc.querySelectorAll<HTMLScriptElement>('script[src]')
  );
  scriptElements.forEach((script) => {
    const src = script.getAttribute('src');
    if (!src) return;
    const cleanName = src.replace(/^(\.\/|\/)/, '');
    const matchingJs = files.find((f) => f.name === cleanName);
    if (matchingJs) {
      const inlineScript = doc.createElement('script');
      inlineScript.setAttribute('data-inlined-from', cleanName);
      const scriptType = script.getAttribute('type');
      if (scriptType) {
        inlineScript.setAttribute('type', scriptType);
      }
      inlineScript.textContent = matchingJs.content;
      script.parentNode?.replaceChild(inlineScript, script);
    }
  });

  // 3. Inject console interceptor script to stream logs back to the application
  const consoleScript = doc.createElement('script');
  consoleScript.textContent = `
    (function() {
      function send(level, text) {
        try {
          window.parent.postMessage({
            type: 'PREVIEW_CONSOLE_LOG',
            level: level,
            message: text
          }, '*');
        } catch(e) {}
      }

      function formatVal(v) {
        if (v === null) return 'null';
        if (v === undefined) return 'undefined';
        if (typeof v === 'string') return v;
        if (typeof v === 'number' || typeof v === 'boolean') return String(v);
        if (typeof v === 'function') return v.toString();
        if (v instanceof Error) return v.stack || (v.name + ': ' + v.message);
        try { return JSON.stringify(v, null, 2); } catch(e) { return String(v); }
      }

      var origLog = console.log;
      console.log = function() {
        var args = Array.prototype.slice.call(arguments);
        send('log', args.map(formatVal).join(' '));
        if (origLog) origLog.apply(console, args);
      };

      var origWarn = console.warn;
      console.warn = function() {
        var args = Array.prototype.slice.call(arguments);
        send('warn', args.map(formatVal).join(' '));
        if (origWarn) origWarn.apply(console, args);
      };

      var origError = console.error;
      console.error = function() {
        var args = Array.prototype.slice.call(arguments);
        send('error', args.map(formatVal).join(' '));
        if (origError) origError.apply(console, args);
      };

      window.addEventListener('error', function(e) {
        var msg = e.error ? (e.error.stack || (e.error.name + ': ' + e.error.message)) : (e.message || 'Error');
        send('error', msg);
      });
    })();
  `;
  const container = doc.head || doc.documentElement;
  if (container) {
    container.insertBefore(consoleScript, container.firstChild);
  }

  return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
}
