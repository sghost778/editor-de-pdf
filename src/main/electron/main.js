import * as path from 'node:path';
import * as fs from 'node:fs';
import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { createLocalApi } from '../services/local-api';
import { buildPrintableDocument } from '../services/pdf-document';
import { getHealthStatus, getJobList, getJobStatus } from '../services/export';
import { exportDocumentSchema } from '../../shared/validation';
async function exportEditedDocument(input) {
    const parsed = exportDocumentSchema.parse(input);
    const outputDirectory = path.join(app.getPath('documents'), 'Converted');
    await fs.promises.mkdir(outputDirectory, { recursive: true });
    const safeName = parsed.title.replace(/[<>:"/\\|?*\x00-\x1f]/g, '-').trim() || 'Edited document';
    const selection = await dialog.showSaveDialog({
        title: 'Save edited document as PDF',
        defaultPath: path.join(outputDirectory, `${safeName}.pdf`),
        filters: [{ name: 'PDF document', extensions: ['pdf'] }],
    });
    if (selection.canceled || !selection.filePath)
        return null;
    const outputPath = selection.filePath.toLowerCase().endsWith('.pdf')
        ? selection.filePath
        : `${selection.filePath}.pdf`;
    const printWindow = new BrowserWindow({
        show: false,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
        },
    });
    try {
        const printable = buildPrintableDocument(parsed.title, parsed.content);
        await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(printable)}`);
        const pdf = await printWindow.webContents.printToPDF({
            printBackground: true,
            pageSize: 'A4',
            margins: { top: 0.75, bottom: 0.75, left: 0.75, right: 0.75 },
        });
        await fs.promises.writeFile(outputPath, pdf);
        return outputPath;
    }
    finally {
        if (!printWindow.isDestroyed())
            printWindow.destroy();
    }
}
const expressApp = createLocalApi(exportEditedDocument);
const port = 3001;
const apiServer = expressApp.listen(port, '127.0.0.1', () => {
    console.log(`PDF converter API listening on http://localhost:${port}`);
});
ipcMain.handle('api:health', async () => getHealthStatus());
ipcMain.handle('api:listJobs', async () => getJobList());
ipcMain.handle('api:convert', async () => {
    throw new Error('PDF-to-editable conversion is not implemented yet.');
});
ipcMain.handle('api:getJob', async (_event, id) => getJobStatus(id) ?? null);
ipcMain.handle('api:exportPdf', async (_event, input) => {
    try {
        const filePath = await exportEditedDocument(input);
        return filePath ? { canceled: false, filePath } : { canceled: true };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to export PDF.';
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
            preload: path.join(__dirname, '../../preload/preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    const indexFile = path.join(__dirname, '../../renderer/index.html');
    if (fs.existsSync(indexFile)) {
        win.loadFile(indexFile);
    }
    else {
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
