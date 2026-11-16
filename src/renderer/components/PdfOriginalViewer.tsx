import { useEffect, useRef, useState } from 'react';
import { Button, Text } from '@fluentui/react-components';
import { FullScreenMaximizeRegular, FullScreenMinimizeRegular, ZoomInRegular, ZoomOutRegular } from '@fluentui/react-icons';
import '../services/pdfjs-compat';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorkerUrl from '../services/pdfjs-worker.ts?worker&url';

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export function PdfOriginalViewer({ data }: { data: Uint8Array }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(1);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return undefined;

    container.replaceChildren();
    setLoading(true);
    setError('');
    const loadingTask = getDocument({ data: data.slice() });

    loadingTask.promise.then(async (pdf) => {
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        if (cancelled) return;
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.25 * zoom });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) throw new Error('No se pudo mostrar una página del PDF.');

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        canvas.style.width = `${100 * zoom}%`;
        canvas.style.height = 'auto';
        canvas.setAttribute('aria-label', `Página original ${pageNumber}`);
        container.appendChild(canvas);
        await page.render({ canvas, canvasContext: context, viewport }).promise;
      }
      if (!cancelled) setLoading(false);
    }).catch((reason: unknown) => {
      if (cancelled) return;
      setLoading(false);
      setError(reason instanceof Error ? reason.message : 'No se pudo mostrar el PDF original.');
    });

    return () => {
      cancelled = true;
      void loadingTask.destroy();
    };
  }, [data, zoom]);

  return (
    <div
      role={expanded ? 'dialog' : undefined}
      aria-modal={expanded || undefined}
      aria-label={expanded ? 'Visor ampliado del PDF original' : undefined}
      style={expanded ? {
        position: 'fixed',
        inset: '16px',
        zIndex: 1000,
        padding: '20px',
        background: '#FFFFFF',
        boxShadow: '0 12px 48px rgba(0, 0, 0, 0.3)',
      } : undefined}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginBottom: '8px' }}>
        <Button
          appearance="subtle"
          icon={<ZoomOutRegular />}
          aria-label="Alejar PDF"
          title="Alejar PDF"
          disabled={zoom <= 0.75}
          onClick={() => setZoom((value) => Math.max(0.75, value - 0.25))}
        />
        <Text size={200}>{Math.round(zoom * 100)}%</Text>
        <Button
          appearance="subtle"
          icon={<ZoomInRegular />}
          aria-label="Acercar PDF"
          title="Acercar PDF"
          disabled={zoom >= 3}
          onClick={() => setZoom((value) => Math.min(3, value + 0.25))}
        />
        <Button
          appearance="subtle"
          icon={expanded ? <FullScreenMinimizeRegular /> : <FullScreenMaximizeRegular />}
          aria-label={expanded ? 'Reducir visor PDF' : 'Ampliar visor PDF'}
          title={expanded ? 'Reducir visor PDF' : 'Ampliar visor PDF'}
          onClick={() => setExpanded((value) => !value)}
        />
      </div>
      {loading && <p role="status">Cargando páginas originales…</p>}
      {error && <p role="alert">{error}</p>}
      <div
        ref={containerRef}
        aria-label="Páginas del PDF original"
        style={{
          display: 'grid',
          gap: '16px',
          maxHeight: expanded ? 'calc(100vh - 110px)' : '70vh',
          overflow: 'auto',
          padding: '4px',
        }}
      />
    </div>
  );
}