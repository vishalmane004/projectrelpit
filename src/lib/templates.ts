import type { ProjectFile } from '../types';

export interface Template {
  label: string;
  files: ProjectFile[];
  defaultActive: string;
}

export const TEMPLATES: Template[] = [
  {
    label: 'Python hello world',
    files: [
      {
        name: 'main.py',
        language: 'python',
        content: '# Python hello world\nprint("Hello, World!")\n',
      },
    ],
    defaultActive: 'main.py',
  },
  {
    label: 'JavaScript hello world',
    files: [
      {
        name: 'index.js',
        language: 'javascript',
        content: '// JavaScript hello world\nconsole.log("Hello, World!");\n',
      },
    ],
    defaultActive: 'index.js',
  },
  {
    label: 'HTML page with CSS',
    files: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My Page</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>Hello, World!</h1>
    <p>Edit me and click Run to preview.</p>
    <script src="index.js"></script>
  </body>
</html>
`,
      },
      {
        name: 'style.css',
        language: 'css',
        content: `body {
  margin: 0;
  padding: 2rem;
  font-family: sans-serif;
  background: #0f172a;
  color: #f8fafc;
}

h1 { color: #818cf8; }
`,
      },
      {
        name: 'index.js',
        language: 'javascript',
        content: `// Runs in the browser preview\ndocument.querySelector('h1').addEventListener('click', () => {\n  alert('You clicked the heading!');\n});\n`,
      },
    ],
    defaultActive: 'index.html',
  },
];
