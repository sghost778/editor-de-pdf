import { describe, expect, it } from 'vitest';
import { createServer } from 'node:http';
import { createLocalApi } from '../src/main/services/local-api';
import { buildPrintableDocument } from '../src/main/services/pdf-document';
async function withApi(api, run) {
    const server = createServer(api);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string')
        throw new Error('Unable to start test API.');
    try {
        return await run(`http://127.0.0.1:${address.port}`);
    }
    finally {
        await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
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
    it('exposes local health, empty jobs, and a real export save result', async () => {
        const api = createLocalApi(async ({ title }) => `C:\\Documents\\${title}.pdf`);
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
    it('rejects invalid export content and reports conversion as not implemented', async () => {
        const api = createLocalApi(async () => null);
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
                    filePath: 'C:/test.pdf',
                    format: 'DOCX',
                    ocrEnabled: false,
                }),
            });
            expect(conversion.status).toBe(501);
            expect((await conversion.json()).error.code).toBe('NOT_IMPLEMENTED');
        });
    });
});
