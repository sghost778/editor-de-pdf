function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
/**
 * Creates a printable HTML document. Electron's printToPDF renders this into
 * a real PDF; the renderer never labels the source HTML as a PDF.
 */
export function buildPrintableDocument(title, content) {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>${escapeHtml(title)}</title>
    <style>
      @page { size: A4; margin: 22mm 20mm; }
      * { box-sizing: border-box; }
      body { color: #132238; font: 11pt/1.6 "Segoe UI", Arial, sans-serif; }
      h1 { margin: 0 0 18pt; font-size: 20pt; line-height: 1.25; }
      main { white-space: pre-wrap; overflow-wrap: anywhere; }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    <main>${escapeHtml(content)}</main>
  </body>
</html>`;
}
