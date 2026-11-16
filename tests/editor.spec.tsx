// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import { EditorExport } from '../src/renderer/pages/EditorExport';
import { extractPdfPages, renderPdfPagesAsImages } from '../src/renderer/services/pdf-extraction';
import '../src/renderer/services/pdfjs-compat';

vi.mock('../src/renderer/services/pdf-extraction', () => ({
  extractPdfPages: vi.fn(),
  renderPdfPagesAsImages: vi.fn(),
}));

vi.mock('../src/renderer/components/PdfOriginalViewer', () => ({
  PdfOriginalViewer: () => <div data-testid="original-pdf">PDF original cargado</div>,
}));

Object.defineProperty(globalThis, 'NodeFilter', {
  configurable: true,
  value: window.NodeFilter ?? { FILTER_SKIP: 5 },
});

describe('edit and export screen', () => {
  const exportPdf = vi.fn();
  const exportDocument = vi.fn();
  const openPdf = vi.fn();

  afterEach(cleanup);

  it('supports the Uint8Array hexadecimal conversion used by PDF.js', () => {
    const bytes = new Uint8Array([0, 15, 255]) as Uint8Array & { toHex: () => string };
    expect(bytes.toHex()).toBe('000fff');
  });

  it('supports computed entries in PDF.js caches', () => {
    const cache = new Map<string, number>() as Map<string, number> & {
      getOrInsertComputed: (key: string, callback: (key: string) => number) => number;
    };
    const createValue = vi.fn((key: string) => key.length);

    expect(cache.getOrInsertComputed('page', createValue)).toBe(4);
    expect(cache.getOrInsertComputed('page', createValue)).toBe(4);
    expect(createValue).toHaveBeenCalledOnce();
  });

  beforeEach(() => {
    exportPdf.mockReset();
    exportPdf.mockResolvedValue({ canceled: false, filePath: 'C:\\Documents\\Edited.pdf' });
    exportDocument.mockReset();
    exportDocument.mockResolvedValue({ canceled: false, filePath: 'C:\\Documents\\Original.docx' });
    openPdf.mockReset();
    openPdf.mockResolvedValue({ fileName: 'Original.pdf', data: new Uint8Array([1, 2, 3]) });
    vi.mocked(extractPdfPages).mockReset();
    vi.mocked(extractPdfPages).mockResolvedValue(['Texto de la página uno', 'Texto de la página dos']);
    vi.mocked(renderPdfPagesAsImages).mockReset();
    vi.mocked(renderPdfPagesAsImages).mockResolvedValue([
      { data: 'data:image/jpeg;base64,dGVzdA==', width: 800, height: 1100 },
      { data: 'data:image/jpeg;base64,dGVzdA==', width: 800, height: 1100 },
    ]);
    Object.defineProperty(window, 'pdfConverter', {
      configurable: true,
      value: { exportPdf, exportDocument, openPdf },
    });
  });

  it('shows the original beside editable text separated by page', async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <EditorExport />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'Abrir PDF' })[0]);

    expect(await screen.findByTestId('original-pdf')).toBeTruthy();
    expect((await screen.findByLabelText('Página 1') as HTMLTextAreaElement).value).toBe('Texto de la página uno');
    expect((screen.getByLabelText('Página 2') as HTMLTextAreaElement).value).toBe('Texto de la página dos');
    expect(openPdf).toHaveBeenCalledOnce();
  });

  it('lets the editable text panel expand and return to the split view', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <EditorExport />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Ampliar editor de texto' }));
    expect(screen.getByRole('button', { name: 'Reducir editor de texto' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Reducir editor de texto' }));
    expect(screen.getByRole('button', { name: 'Ampliar editor de texto' })).toBeTruthy();
  });

  it('shows PDF.js errors returned as plain objects', async () => {
    vi.mocked(extractPdfPages).mockRejectedValue({
      name: 'InvalidPDFException',
      message: 'Estructura PDF no válida',
    });

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <EditorExport />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'Abrir PDF' })[0]);

    expect(await screen.findAllByText('InvalidPDFException: Estructura PDF no válida')).not.toHaveLength(0);
  });

  it('exports original page images before editable OCR text in DOCX', async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <EditorExport />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'Abrir PDF' })[0]);
    await screen.findByLabelText('Página 1');
    await waitFor(() => expect((screen.getAllByRole('button', { name: 'Abrir PDF' })[0] as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar como DOCX' }));

    await waitFor(() => expect(renderPdfPagesAsImages).toHaveBeenCalledWith(
      new Uint8Array([1, 2, 3]),
      expect.any(Function),
    ));
    await waitFor(() => expect(exportDocument).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Original',
      content: 'Texto de la página uno\fTexto de la página dos',
      format: 'DOCX',
      pageImages: [
        { data: 'data:image/jpeg;base64,dGVzdA==', width: 800, height: 1100 },
        { data: 'data:image/jpeg;base64,dGVzdA==', width: 800, height: 1100 },
      ],
    })));
  });

  it('sends the edited title and text to the local PDF export bridge', async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <EditorExport />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'Abrir PDF' })[0]);
    await screen.findByLabelText('Página 1');
    await waitFor(() => expect((screen.getAllByRole('button', { name: 'Abrir PDF' })[0] as HTMLButtonElement).disabled).toBe(false));
    fireEvent.change(screen.getByLabelText('Título del documento'), { target: { value: 'Edited document' } });
    fireEvent.change(screen.getByLabelText('Página 1'), { target: { value: 'The final edited text.' } });
    expect((screen.getByLabelText('Título del documento') as HTMLInputElement).value).toBe('Edited document');
    expect((screen.getByLabelText('Página 1') as HTMLTextAreaElement).value).toBe('The final edited text.');
    const pdfButtons = screen.getAllByRole('button', { name: 'Guardar como PDF' });
    await waitFor(() => expect((pdfButtons[pdfButtons.length - 1] as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(pdfButtons[pdfButtons.length - 1]);

    await waitFor(() => expect(exportPdf).toHaveBeenCalledWith({
      title: 'Edited document',
      content: 'The final edited text.\fTexto de la página dos',
      pageImages: [
        { data: 'data:image/jpeg;base64,dGVzdA==', width: 800, height: 1100 },
        { data: 'data:image/jpeg;base64,dGVzdA==', width: 800, height: 1100 },
      ],
    }));
    expect(await screen.findAllByText(/PDF guardado en: C:\\Documents\\Edited\.pdf/)).not.toHaveLength(0);
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  });
});
