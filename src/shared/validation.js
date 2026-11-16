import { z } from 'zod';
import { OUTPUT_FORMATS } from './formats';
export const convertSchema = z.object({
    filePath: z.string().min(1, 'A PDF file path is required.'),
    format: z.enum(OUTPUT_FORMATS),
    ocrEnabled: z.boolean().default(false),
});
export const jobIdSchema = z.object({
    id: z.string().min(1),
});
export const exportDocumentSchema = z.object({
    title: z.string().trim().min(1, 'A document title is required.').max(200),
    content: z.string().min(1, 'Add some document content before exporting.').max(2_000_000),
});
