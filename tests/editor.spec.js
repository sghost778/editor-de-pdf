import { jsx as _jsx } from "react/jsx-runtime";
// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { EditorExport } from '../src/renderer/pages/EditorExport';
describe('edit and export screen', () => {
    const exportPdf = vi.fn();
    beforeEach(() => {
        exportPdf.mockReset();
        exportPdf.mockResolvedValue({ canceled: false, filePath: 'C:\\Documents\\Edited.pdf' });
        Object.defineProperty(window, 'pdfConverter', {
            configurable: true,
            value: { exportPdf },
        });
    });
    it('sends the edited title and text to the local PDF export bridge', async () => {
        render(_jsx(MemoryRouter, { children: _jsx(EditorExport, {}) }));
        fireEvent.change(screen.getByLabelText('Document title'), { target: { value: 'Edited document' } });
        fireEvent.change(screen.getByLabelText('Editable content'), { target: { value: 'The final edited text.' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save as PDF' }));
        await waitFor(() => expect(exportPdf).toHaveBeenCalledWith({
            title: 'Edited document',
            content: 'The final edited text.',
        }));
        expect(await screen.findByText(/PDF saved: C:\\Documents\\Edited\.pdf/)).toBeTruthy();
    });
});
