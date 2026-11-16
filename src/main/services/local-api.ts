import express, { Request, Response } from 'express';

import { getHealthStatus, getJobList, getJobStatus } from './export';
import { documentFileSchema, ExportDocumentInput, exportDocumentSchema } from '../../shared/validation';

export type PdfExporter = (input: ExportDocumentInput) => Promise<string | null>;
export type DocumentExporter = (input: { title: string; content: string; format: 'DOCX' | 'XLSX' | 'PPTX' | 'TXT' }) => Promise<string>;

export function createLocalApi(exportPdf: PdfExporter, exportDocument: DocumentExporter) {
  const api = express();
  api.use(express.json({ limit: '2mb' }));

  api.get('/api/health', (_req, res) => {
    const health = getHealthStatus();
    res.status(200).json(health);
  });

  api.get('/api/jobs', (_req, res) => {
    res.status(200).json(getJobList());
  });

  api.post('/api/convert', async (req, res) => {
    const parsed = documentFileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Invalid document.' },
      });
      return;
    }

    try {
      const filePath = await exportDocument(parsed.data);
      res.status(200).json({ fileName: filePath.split(/\\|\//).pop(), filePath });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to convert the document.';
      res.status(500).json({ error: { code: 'CONVERSION_FAILED', message } });
    }
  });

  api.post('/api/export-pdf', async (req: Request, res: Response) => {
    const parsed = exportDocumentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Invalid document.' },
      });
      return;
    }

    try {
      const filePath = await exportPdf(parsed.data);
      if (!filePath) {
        res.status(409).json({ error: { code: 'CANCELLED', message: 'PDF export was cancelled.' } });
        return;
      }
      res.status(200).json({ fileName: filePath.split(/\\|\//).pop(), filePath });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to export PDF.';
      res.status(500).json({ error: { code: 'EXPORT_FAILED', message } });
    }
  });

  api.get('/api/jobs/:id', (req, res) => {
    const job = getJobStatus(req.params.id);
    if (!job) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Job not found.' } });
      return;
    }
    res.status(200).json(job);
  });

  return api;
}
