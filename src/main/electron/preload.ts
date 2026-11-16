import { contextBridge, ipcRenderer } from 'electron';
import { FileJob } from '../../shared/file-types';
import { DocumentFileInput, ExportDocumentInput } from '../../shared/validation';

export type ConvertRequest = {
  filePath: string;
  format: 'DOCX' | 'XLSX' | 'PPTX' | 'TXT';
  ocrEnabled: boolean;
};

export type ConversionApi = {
  health: () => Promise<{ status: string; services: Record<string, string> }>;
  listJobs: () => Promise<FileJob[]>;
  openPdf: () => Promise<{ fileName: string; data: Uint8Array } | null>;
  convert: (payload: DocumentFileInput) => Promise<{ canceled: boolean; filePath?: string }>;
  getJob: (id: string) => Promise<FileJob | null>;
  exportDocument: (payload: DocumentFileInput) => Promise<{ canceled: boolean; filePath?: string }>;
  exportPdf: (payload: ExportDocumentInput) => Promise<{ canceled: boolean; filePath?: string }>;
};

contextBridge.exposeInMainWorld('pdfConverter', {
  health: () => ipcRenderer.invoke('api:health'),
  listJobs: () => ipcRenderer.invoke('api:listJobs'),
  openPdf: () => ipcRenderer.invoke('api:openPdf'),
  convert: (payload: DocumentFileInput) => ipcRenderer.invoke('api:convert', payload),
  getJob: (id: string) => ipcRenderer.invoke('api:getJob', id),
  exportDocument: (payload: DocumentFileInput) => ipcRenderer.invoke('api:exportDocument', payload),
  exportPdf: (payload: ExportDocumentInput) => ipcRenderer.invoke('api:exportPdf', payload),
});

declare global {
  interface Window {
    pdfConverter: ConversionApi;
  }
}
