import { FileJob } from '../../shared/file-types';
export type { FileJob };

const jobs = new Map<string, FileJob>();

export function getJobStatus(jobId: string): FileJob | undefined {
  return jobs.get(jobId);
}

export function getHealthStatus() {
  return {
    status: 'healthy',
    services: {
      localFileSystem: 'healthy',
      pdfExport: 'available',
      conversionEngine: 'available',
      ocrEngine: 'available_on_scanned_pages',
    },
  };
}

export function getJobList(): FileJob[] {
  return [...jobs.values()];
}
