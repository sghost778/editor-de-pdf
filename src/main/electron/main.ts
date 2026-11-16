import * as path from 'node:path';
import * as fs from 'node:fs';

import { app, BrowserWindow, dialog, ipcMain } from 'electron';

import { createLocalApi } from '../services/local-api';
import { createDocumentFile } from '../services/document-conversion';
import { renderDocumentPdf } from '../services/pdf-renderer';
import { getHealthStatus, getJobList, getJobStatus } from '../services/export';
import { documentFileSchema, DocumentFileInput, exportDocumentSchema, ExportDocumentInput } from '../../shared/validation';

async function exportEditedDocument(input: ExportDocumentInput): Promise<string | null> {
  const parsed = exportDocumentSchema.parse(input);
  const outputDirectory = path.join(app.getPath('documents'), 'Converted');
  await fs.promises.mkdir(outputDirectory, { recursive: true });

  const safeName = parsed.title.replace(/[<>:"/\\|?*\x00-\x1f]/g, '-').trim() || 'Edited document';
  const selection = await dialog.showSaveDialog({
    title: 'Guardar el documento editado como PDF',
    defaultPath: path.join(outputDirectory, `${safeName}.pdf`),
    filters: [{ name: 'Documento PDF', extensions: ['pdf'] }],
  });
  if (selection.canceled || !selection.filePath) return null;
  const outputPath = selection.filePath.toLowerCase().endsWith('.pdf')
    ? selection.filePath
    : `${selection.filePath}.pdf`;

  const pdf = await renderDocumentPdf(parsed.title, parsed.content, parsed.pageImages);
  await fs.promises.writeFile(outputPath, pdf);
  return outputPath;
}

function safeFileName(title: string) {
  return title.replace(/[<>:"/\\|?*\x00-\x1f]/g, '-').trim() || 'Edited document';
}

async function exportEditedDocumentFile(input: DocumentFileInput): Promise<string | null> {
  const parsed = documentFileSchema.parse(input);
  const extension = parsed.format.toLowerCase();
  const outputDirectory = path.join(app.getPath('documents'), 'Converted');
  await fs.promises.mkdir(outputDirectory, { recursive: true });

  const selection = await dialog.showSaveDialog({
    title: `Guardar como ${parsed.format}`,
    defaultPath: path.join(outputDirectory, `${safeFileName(parsed.title)}.${extension}`),
    filters: [{ name: `Documento ${parsed.format}`, extensions: [extension] }],
  });
  if (selection.canceled || !selection.filePath) return null;

  const outputPath = selection.filePath.toLowerCase().endsWith(`.${extension}`)
    ? selection.filePath
    : `${selection.filePath}.${extension}`;
  const contents = await createDocumentFile(parsed);
  await fs.promises.writeFile(outputPath, contents);
  return outputPath;
}

async function exportDocumentToDefaultPath(input: DocumentFileInput): Promise<string> {
  const parsed = documentFileSchema.parse(input);
  const extension = parsed.format.toLowerCase();
  const outputDirectory = path.join(app.getPath('documents'), 'Converted');
  await fs.promises.mkdir(outputDirectory, { recursive: true });
  const outputPath = path.join(outputDirectory, `${safeFileName(parsed.title)}.${extension}`);
  const contents = await createDocumentFile(parsed);
  await fs.promises.writeFile(outputPath, contents);
  return outputPath;
}

const expressApp = createLocalApi(exportEditedDocument, exportDocumentToDefaultPath);
const port = 3001;
const apiServer = expressApp.listen(port, '127.0.0.1', () => {
  console.log(`PDF converter API listening on http://localhost:${port}`);
});

ipcMain.handle('api:health', async () => getHealthStatus());
ipcMain.handle('api:listJobs', async () => getJobList());
ipcMain.handle('api:openPdf', async () => {
  const selection = await dialog.showOpenDialog({
    title: 'Abrir PDF',
    properties: ['openFile'],
    filters: [{ name: 'Documentos PDF', extensions: ['pdf'] }],
  });
  if (selection.canceled || selection.filePaths.length === 0) return null;

  const filePath = selection.filePaths[0];
  const stats = await fs.promises.stat(filePath);
  if (stats.size > 100 * 1024 * 1024) {
    throw new Error('No se admiten archivos PDF de más de 100 MB.');
  }
  const data = await fs.promises.readFile(filePath);
  return { fileName: path.basename(filePath), data: new Uint8Array(data) };
});
ipcMain.handle('api:convert', async (_event, input: DocumentFileInput) => {
  try {
    const filePath = await exportEditedDocumentFile(input);
    return filePath ? { canceled: false, filePath } : { canceled: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo convertir el documento.';
    throw new Error(message);
  }
});
ipcMain.handle('api:getJob', async (_event, id: string) => getJobStatus(id) ?? null);
ipcMain.handle('api:exportDocument', async (_event, input: DocumentFileInput) => {
  try {
    const filePath = await exportEditedDocumentFile(input);
    return filePath ? { canceled: false, filePath } : { canceled: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo exportar el documento.';
    throw new Error(message);
  }
});
ipcMain.handle('api:exportPdf', async (_event, input: ExportDocumentInput) => {
  try {
    const filePath = await exportEditedDocument(input);
    return filePath ? { canceled: false, filePath } : { canceled: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo exportar el PDF.';
    throw new Error(message);
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 820,
    backgroundColor: '#F5F7FB',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const indexFile = path.join(__dirname, '../../renderer/index.html');
  if (fs.existsSync(indexFile)) {
    win.loadFile(indexFile);
  } else {
    win.loadURL('http://localhost:5173');
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  apiServer.close();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
