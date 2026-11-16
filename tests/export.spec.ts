import { describe, expect, it } from 'vitest';
import { createServer } from 'node:http';

import { createLocalApi } from '../src/main/services/local-api';
import { createDocumentFile } from '../src/main/services/document-conversion';
import { buildPrintableDocument } from '../src/main/services/pdf-document';

async function withApi<T>(api: ReturnType<typeof createLocalApi>, run: (baseUrl: string) => Promise<T>) {
  const server = createServer(api);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Unable to start test API.');
  try {
    return await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

describe('local PDF export and API', () => {
  it('escapes user-supplied content in the printable document', () => {
    const html = buildPrintableDocument('<title>', '<script>alert(1)</script>\n& content');
    expect(html).toContain('&lt;title&gt;');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('&amp; content');
    expect(html).toContain('white-space: pre-wrap');
  });

  it('embeds original PDF pages before editable text in the exported PDF', () => {
    const html = buildPrintableDocument('Source', 'Editable text', [{
      data: 'data:image/jpeg;base64,dGVzdA==',
      width: 800,
      height: 1100,
    }]);

    expect(html).toContain('class="original-page"');
    expect(html).toContain('src="data:image/jpeg;base64,dGVzdA=="');
    expect(html.indexOf('class="original-page"')).toBeLessThan(html.indexOf('Editable text'));
  });

  it('embeds original page images in XLSX and PPTX exports', async () => {
    const pageImages = [{
      data: 'data:image/jpeg;base64,dGVzdA==',
      width: 800,
      height: 1100,
    }];
    const spreadsheet = await createDocumentFile({
      title: 'Source',
      content: 'Editable text',
      format: 'XLSX',
      pageImages,
    });
    const presentation = await createDocumentFile({
      title: 'Source',
      content: 'Editable text',
      format: 'PPTX',
      pageImages,
    });

    expect(spreadsheet.includes(Buffer.from('xl/media/image1.jpeg'))).toBe(true);
    expect(presentation.includes(Buffer.from('ppt/media/'))).toBe(true);
  });

  it('exposes local health, empty jobs, and a real export save result', async () => {
    const api = createLocalApi(
      async ({ title }) => `C:\\Documents\\${title}.pdf`,
      async ({ title, format }) => `C:\\Documents\\${title}.${format.toLowerCase()}`,
    );

    await withApi(api, async (baseUrl) => {
      const health = await fetch(`${baseUrl}/api/health`);
      expect(health.status).toBe(200);
      expect((await health.json()).services.pdfExport).toBe('available');

      const jobs = await fetch(`${baseUrl}/api/jobs`);
      expect(jobs.status).toBe(200);
      expect(await jobs.json()).toEqual([]);

      const exported = await fetch(`${baseUrl}/api/export-pdf`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title: 'Edited document', content: 'Final text' }),
      });
      expect(exported.status).toBe(200);
      expect((await exported.json()).filePath).toBe('C:\\Documents\\Edited document.pdf');
    });
  });

  it('rejects invalid export content and saves a converted document', async () => {
    const api = createLocalApi(async () => null, async () => 'C:\\Documents\\Converted.docx');

    await withApi(api, async (baseUrl) => {
      const invalidExport = await fetch(`${baseUrl}/api/export-pdf`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title: '', content: '' }),
      });
      expect(invalidExport.status).toBe(400);

      const conversion = await fetch(`${baseUrl}/api/convert`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: 'Converted document',
          content: 'Extracted text',
          format: 'DOCX',
        }),
      });
      expect(conversion.status).toBe(200);
      expect((await conversion.json()).filePath).toBe('C:\\Documents\\Converted.docx');
    });
  });
});
