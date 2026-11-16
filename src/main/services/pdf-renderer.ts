import { BrowserWindow } from 'electron';

import { buildPrintableDocument } from './pdf-document';
import { PageImageInput } from '../../shared/validation';

export async function renderDocumentPdf(title: string, content: string, pageImages: PageImageInput[] = []): Promise<Buffer> {
  const printWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  try {
    const printable = buildPrintableDocument(title, content, pageImages);
    await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(printable)}`);
    return await printWindow.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      margins: { top: 0.75, bottom: 0.75, left: 0.75, right: 0.75 },
    });
  } finally {
    if (!printWindow.isDestroyed()) printWindow.destroy();
  }
}
