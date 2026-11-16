import { convertSchema } from '../../shared/validation';
// The job store is intentionally empty until a real PDF-to-document engine is
// added. Do not fabricate jobs or progress for a conversion that did not run.
const jobs = new Map();
export function convertPdf(input) {
    convertSchema.parse(input);
    throw new Error('PDF-to-editable conversion is not implemented yet.');
}
export function getJobStatus(jobId) {
    return jobs.get(jobId);
}
export function getHealthStatus() {
    return {
        status: 'healthy',
        services: {
            localFileSystem: 'healthy',
            pdfExport: 'available',
            conversionEngine: 'not_implemented',
            ocrEngine: 'not_implemented',
        },
    };
}
export function getJobList() {
    return [...jobs.values()];
}
