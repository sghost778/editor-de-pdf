import './pdfjs-compat';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorkerUrl from './pdfjs-worker.ts?worker&url';
import { createWorker, PSM, Worker } from 'tesseract.js';
import tesseractWorkerUrl from 'tesseract.js/dist/worker.min.js?url';
import tesseractCoreUrl from 'tesseract.js-core/tesseract-core-simd-lstm.wasm.js?url';

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export type PdfExtractionProgress = (currentPage: number, totalPages: number) => void;

export type PdfPageImage = {
  data: string;
  width: number;
  height: number;
};

export async function renderPdfPagesAsImages(
  data: Uint8Array,
  onProgress: PdfExtractionProgress = () => undefined,
): Promise<PdfPageImage[]> {
  const loadingTask = getDocument({ data: data.slice() });
  const pdf = await loadingTask.promise;
  const pages: PdfPageImage[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = Math.min(1.5, 1800 / Math.max(baseViewport.width, baseViewport.height));
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { alpha: false });
      if (!context) throw new Error('No se pudo preparar la imagen de una página del PDF.');

      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      await page.render({ canvas, canvasContext: context, viewport }).promise;
      pages.push({
        data: canvas.toDataURL('image/jpeg', 0.84),
        width: canvas.width,
        height: canvas.height,
      });
      canvas.width = 0;
      canvas.height = 0;
      onProgress(pageNumber, pdf.numPages);
    }
  } finally {
    await loadingTask.destroy();
  }

  return pages;
}

function pageText(items: unknown[]) {
  let text = '';
  for (const item of items) {
    if (typeof item !== 'object' || item === null || !('str' in item) || typeof item.str !== 'string' || !item.str) continue;
    text += item.str;
    text += 'hasEOL' in item && item.hasEOL ? '\n' : ' ';
  }
  return text.trim();
}

export async function extractPdfPages(
  data: Uint8Array,
  runOcr: boolean,
  onProgress: PdfExtractionProgress = () => undefined,
) {
  const loadingTask = getDocument({ data: data.slice() });
  const pdf = await loadingTask.promise;
  let ocrWorker: Worker | undefined;
  const pages: string[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      let text = pageText(content.items);

      if (runOcr || text.length < 8) {
        if (!ocrWorker) {
          ocrWorker = await createWorker('spa+eng+rus', undefined, {
            workerPath: tesseractWorkerUrl,
            corePath: tesseractCoreUrl,
            workerBlobURL: false,
          });
          await ocrWorker.setParameters({
            preserve_interword_spaces: '1',
            tessedit_pageseg_mode: PSM.AUTO,
            user_defined_dpi: '300',
          });
        }
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = Math.min(3.2, 2600 / Math.max(baseViewport.width, baseViewport.height));
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) throw new Error('No se pudo preparar la página del PDF para procesarla.');

        context.filter = 'grayscale(1) contrast(1.2)';
        await page.render({ canvas, canvasContext: context, viewport }).promise;
        const result = await ocrWorker.recognize(canvas);
        const recognizedText = result.data.text.trim();
        if (recognizedText && (runOcr || recognizedText.length > text.length)) text = recognizedText;
        canvas.width = 0;
        canvas.height = 0;
      }

      pages.push(text);
      onProgress(pageNumber, pdf.numPages);
    }
  } finally {
    if (ocrWorker) await ocrWorker.terminate();
    await loadingTask.destroy();
  }

  return pages;
}
