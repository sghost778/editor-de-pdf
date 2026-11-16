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
  pageImages: z.array(z.object({
    data: z.string().startsWith('data:image/jpeg;base64,').max(6_000_000),
    width: z.number().int().positive().max(10000),
    height: z.number().int().positive().max(10000),
  })).max(40).optional().superRefine((images, context) => {
    if ((images ?? []).reduce((total, image) => total + image.data.length, 0) > 80_000_000) {
      context.addIssue({ code: 'custom', message: 'El tamaño total de las imágenes originales supera el límite de 80 MB.' });
    }
  }),
});

export const documentFileSchema = exportDocumentSchema.extend({
  format: z.enum(OUTPUT_FORMATS),
});

export type ConvertInput = z.infer<typeof convertSchema>;
export type JobIdParams = z.infer<typeof jobIdSchema>;
export type ExportDocumentInput = z.infer<typeof exportDocumentSchema>;
export type PageImageInput = NonNullable<ExportDocumentInput['pageImages']>[number];
export type DocumentFileInput = z.infer<typeof documentFileSchema>;
