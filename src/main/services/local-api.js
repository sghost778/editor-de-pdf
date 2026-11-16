import express from 'express';
import { convertPdf, getHealthStatus, getJobList, getJobStatus } from './export';
import { exportDocumentSchema } from '../../shared/validation';
export function createLocalApi(exportPdf) {
    const api = express();
    api.use(express.json({ limit: '2mb' }));
    api.get('/api/health', (_req, res) => {
        const health = getHealthStatus();
        res.status(200).json(health);
    });
    api.get('/api/jobs', (_req, res) => {
        res.status(200).json(getJobList());
    });
    api.post('/api/convert', (req, res) => {
        try {
            convertPdf(req.body);
            res.status(202).json({ status: 'accepted' });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to convert PDF.';
            const status = message.includes('not implemented') ? 501 : 400;
            res.status(status).json({ error: { code: status === 501 ? 'NOT_IMPLEMENTED' : 'VALIDATION_ERROR', message } });
        }
    });
    api.post('/api/export-pdf', async (req, res) => {
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
        }
        catch (error) {
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
