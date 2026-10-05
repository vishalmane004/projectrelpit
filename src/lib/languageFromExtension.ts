export function languageFromExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  switch (ext) {
    case 'py':   return 'python';
    case 'js':   return 'javascript';
    case 'html': return 'html';
    case 'css':  return 'css';
    case 'ts':   return 'typescript';
    case 'json': return 'json';
    case 'md':   return 'markdown';
    default:     return 'plaintext';
  }
}
