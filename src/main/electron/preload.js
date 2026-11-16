import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('pdfConverter', {
    health: () => ipcRenderer.invoke('api:health'),
    listJobs: () => ipcRenderer.invoke('api:listJobs'),
    convert: (payload) => ipcRenderer.invoke('api:convert', payload),
    getJob: (id) => ipcRenderer.invoke('api:getJob', id),
    exportPdf: (payload) => ipcRenderer.invoke('api:exportPdf', payload),
});
