import { buildOutputPath } from '../services/pdf';
export const resolveOutputDirectory = (filePath, format) => buildOutputPath(filePath, format, filePath.split(/\\|\//).pop() ?? 'converted-document');
