import { PageImageInput } from '../../shared/validation';

function escapeHtml(value: string) {
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
export function buildPrintableDocument(title: string, content: string, pageImages: PageImageInput[] = []) {
  const pages = content.split('\f');
  const originalPages = pageImages.map((image, index) => `
      <section class="original-page">
        <img src="${escapeHtml(image.data)}" alt="Página original ${index + 1}">
      </section>`).join('');
  const editableContent = pages.map((page) => `<section class="source-page">${escapeHtml(page)}</section>`).join('');
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <title>${escapeHtml(title)}</title>
    <style>
      @page { size: A4; margin: 22mm 20mm; }
      * { box-sizing: border-box; }
      body { color: #132238; font: 11pt/1.6 "Segoe UI", Arial, sans-serif; }
      h1 { margin: 0 0 18pt; font-size: 20pt; line-height: 1.25; }
      main { overflow-wrap: anywhere; }
      .original-page { height: 250mm; display: flex; align-items: center; justify-content: center; break-after: page; page-break-after: always; }
      .original-page img { max-width: 100%; max-height: 100%; object-fit: contain; }
      .source-page { white-space: pre-wrap; break-after: page; page-break-after: always; }
      .source-page:last-child { break-after: auto; page-break-after: auto; }
    </style>
  </head>
  <body>
    <main>
      ${originalPages}
      <h1>${escapeHtml(title)}</h1>
      ${pageImages.length > 0 ? '<h2>Texto editable</h2>' : ''}
      ${editableContent}
    </main>
  </body>
</html>`;
}
