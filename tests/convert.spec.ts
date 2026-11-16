import { describe, expect, it } from 'vitest';

import { getHealthStatus, getJobList, getJobStatus } from '../src/main/services/export';

describe('local conversion capability status', () => {
  it('does not invent conversion jobs before a document is processed', () => {
    expect(getJobList()).toEqual([]);
    expect(getJobStatus('sample-job')).toBeUndefined();
  });

  it('reports local conversion and OCR as available', () => {
    const health = getHealthStatus();
    expect(health.services.pdfExport).toBe('available');
    expect(health.services.conversionEngine).toBe('available');
    expect(health.services.ocrEngine).toBe('available_on_scanned_pages');
  });
});
