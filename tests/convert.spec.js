import { describe, expect, it } from 'vitest';
import { convertPdf, getHealthStatus, getJobList, getJobStatus } from '../src/main/services/export';
describe('local conversion capability status', () => {
    it('does not report a conversion job as complete when no converter exists', () => {
        expect(() => convertPdf({
            filePath: 'C:/Users/test/Documents/invoice.pdf',
            format: 'DOCX',
            ocrEnabled: false,
        })).toThrow(/not implemented/i);
        expect(getJobList()).toEqual([]);
        expect(getJobStatus('sample-job')).toBeUndefined();
    });
    it('reports the local PDF export as available and conversion/OCR as unimplemented', () => {
        const health = getHealthStatus();
        expect(health.services.pdfExport).toBe('available');
        expect(health.services.conversionEngine).toBe('not_implemented');
        expect(health.services.ocrEngine).toBe('not_implemented');
    });
});
