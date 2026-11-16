export type JobStatus = 'queued' | 'running' | 'completed' | 'needs_review' | 'failed';

export interface FileJob {
  id: string;
  fileName: string;
  outputFormat: 'DOCX' | 'XLSX' | 'PPTX' | 'TXT';
  ocrEnabled: boolean;
  status: JobStatus;
  progress: number;
  outputPath: string;
  createdAt: string;
}
