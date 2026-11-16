import { buildOutputPath } from '../services/pdf';

export const resolveOutputDirectory = (filePath: string, format: 'DOCX' | 'XLSX' | 'PPTX' | 'TXT') =>
  buildOutputPath(filePath, format, filePath.split(/\\|\//).pop() ?? 'converted-document');
