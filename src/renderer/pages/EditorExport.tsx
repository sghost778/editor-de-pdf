import { useState } from 'react';
import {
  Button,
  Card,
  Dropdown,
  Input,
  Label,
  makeStyles,
  mergeClasses,
  Option,
  Switch,
  Text,
  Textarea,
  Title2,
  tokens,
} from '@fluentui/react-components';
import { ArrowLeftRegular, FullScreenMaximizeRegular, FullScreenMinimizeRegular, SaveRegular } from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';

import { OutputFormat } from '../../shared/formats';
import { PdfOriginalViewer } from '../components/PdfOriginalViewer';
import { extractPdfPages, renderPdfPagesAsImages } from '../services/pdf-extraction';

const useStyles = makeStyles({
  shell: {
    maxWidth: '1180px',
    margin: '0 auto',
    padding: '30px 24px 48px',
    display: 'grid',
    gap: '20px',
  },
  columns: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    gap: '20px',
    '@media (max-width: 760px)': { gridTemplateColumns: '1fr' },
  },
  panel: {
    minHeight: '420px',
    padding: '22px',
    display: 'grid',
    alignContent: 'start',
    gap: '14px',
    background: '#FFFFFF',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '16px',
  },
  textarea: { minHeight: '300px', width: '100%' },
  pageEditor: { minHeight: '180px', width: '100%' },
  pageList: { display: 'grid', gap: '18px', maxHeight: '70vh', overflow: 'auto', paddingRight: '4px' },
  preview: {
    minHeight: '300px',
    padding: '24px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '8px',
    background: '#FFFFFF',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    lineHeight: '1.6',
  },
  actions: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' },
  status: { minHeight: '24px', color: tokens.colorNeutralForeground2 },
  expandedPanel: {
    position: 'fixed',
    inset: '16px',
    zIndex: 1000,
    overflow: 'auto',
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.3)',
  },
});

function errorMessage(reason: unknown, fallback: string) {
  if (typeof reason === 'string' && reason.trim()) return reason;
  if (typeof reason === 'object' && reason !== null && 'message' in reason) {
    const message = reason.message;
    if (typeof message === 'string' && message.trim()) {
      const name = 'name' in reason && typeof reason.name === 'string' ? reason.name : '';
      return name && name !== 'Error' ? `${name}: ${message}` : message;
    }
  }
  return reason instanceof Error ? reason.message : fallback;
}

export function EditorExport() {
  const styles = useStyles();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [pages, setPages] = useState<string[]>([]);
  const [originalPdf, setOriginalPdf] = useState<Uint8Array | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [ocrEnabled, setOcrEnabled] = useState(false);
  const [format, setFormat] = useState<OutputFormat>('DOCX');
  const [sourceFile, setSourceFile] = useState('');
  const [progress, setProgress] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [editorExpanded, setEditorExpanded] = useState(false);
  const content = pages.join('\f');

  async function openPdf() {
    setError('');
    setStatus('');
    setProgress('');
    setLoadingPdf(true);
    try {
      if (!window.pdfConverter) {
        throw new Error('Abrir archivos PDF solo está disponible en la aplicación de escritorio.');
      }
      const openPdf = window.pdfConverter.openPdf;
      if (typeof openPdf !== 'function') {
        throw new Error('No se pudo conectar con el módulo para abrir PDF. Cierra y vuelve a abrir la aplicación.');
      }
      const selected = await openPdf();
      if (!selected) return;

      const extractedPages = await extractPdfPages(selected.data, ocrEnabled, (page, total) => {
        setProgress(`Leyendo página ${page} de ${total}…`);
      });
      if (!extractedPages.some((page) => page.trim())) {
        throw new Error(ocrEnabled
          ? 'No se encontró texto legible. El PDF podría estar vacío o la calidad del escaneo ser demasiado baja.'
          : 'Este PDF no contiene texto seleccionable. Activa el OCR y vuelve a abrirlo para leer las páginas escaneadas.');
      }

      setTitle(selected.fileName.replace(/\.pdf$/i, ''));
      setPages(extractedPages);
      setOriginalPdf(selected.data);
      setSourceFile(selected.fileName);
      setProgress('');
      setStatus(`Texto extraído de ${selected.fileName}. Revísalo y edítalo antes de exportar.`);
    } catch (reason) {
      setError(errorMessage(reason, 'No se pudo abrir este PDF.'));
    } finally {
      setLoadingPdf(false);
      setProgress('');
    }
  }

  async function saveAsFormat() {
    setError('');
    setStatus('');
    setSaving(true);
    try {
      if (!window.pdfConverter) {
        throw new Error('La exportación de documentos solo está disponible en la aplicación de escritorio.');
      }
      let pageImages;
      if (format !== 'TXT' && originalPdf) {
        setProgress('Preparando imágenes originales para el archivo…');
        pageImages = await renderPdfPagesAsImages(originalPdf, (page, total) => {
          setProgress(`Preparando página ${page} de ${total}…`);
        });
      }
      const result = await window.pdfConverter.exportDocument({
        title: title.trim(),
        content,
        format,
        pageImages,
      });
      if (result.canceled) {
        setStatus(`Se canceló la exportación a ${format}. Tus cambios siguen aquí.`);
      } else if (result.filePath) {
        setStatus(`${format} guardado en: ${result.filePath}`);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : `Falló la exportación a ${format}.`);
    } finally {
      setSaving(false);
    }
  }

  async function saveAsPdf() {
    setError('');
    setStatus('');
    setSaving(true);
    try {
      if (!window.pdfConverter) {
        throw new Error('La exportación a PDF solo está disponible en la aplicación de escritorio.');
      }
      let pageImages;
      if (originalPdf) {
        setProgress('Preparando páginas originales para el PDF…');
        pageImages = await renderPdfPagesAsImages(originalPdf, (page, total) => {
          setProgress(`Preparando página ${page} de ${total}…`);
        });
      }
      const result = await window.pdfConverter.exportPdf({ title: title.trim(), content, pageImages });
      if (result.canceled) {
        setStatus('Se canceló la exportación a PDF. Tus cambios siguen aquí.');
      } else if (result.filePath) {
        setStatus(`PDF guardado en: ${result.filePath}`);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Falló la exportación a PDF.');
    } finally {
      setSaving(false);
      setProgress('');
    }
  }

  return (
    <main className={styles.shell}>
      <Button appearance="subtle" icon={<ArrowLeftRegular />} onClick={() => navigate('/')}>
        Volver a las conversiones
      </Button>
      <div>
        <Title2 as="h2">Editar y exportar</Title2>
        <Text>
          Abre un PDF para extraer el texto, editarlo y guardarlo localmente como DOCX, XLSX, PPTX, TXT o PDF.
        </Text>
      </div>
      <Card className={styles.panel}>
        <Text weight="semibold">Importar un PDF</Text>
        <div className={styles.actions}>
          <Button appearance="primary" icon={<ArrowLeftRegular />} disabled={loadingPdf || saving} onClick={openPdf}>
            {loadingPdf ? 'Leyendo PDF…' : 'Abrir PDF'}
          </Button>
          <Switch
            checked={ocrEnabled}
            label="Aplicar OCR también a páginas con texto"
            onChange={(_event, data) => setOcrEnabled(data.checked)}
          />
        </div>
        {sourceFile && <Text size={200}>Archivo de origen: {sourceFile}</Text>}
        {progress && <Text role="status">{progress}</Text>}
        <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
          Las páginas sin texto seleccionable usan OCR automáticamente. Activa esta opción para buscar texto dentro de imágenes en páginas que ya contienen texto. El OCR reconoce español, inglés y ruso; la primera vez se descargan los datos de idioma y todo se procesa localmente.
        </Text>
      </Card>
      <div className={styles.columns}>
          <Card className={styles.panel}>
            <Text weight="semibold">PDF original</Text>
            {originalPdf
              ? <PdfOriginalViewer data={originalPdf} />
              : <Text>El PDF original aparecerá aquí después de abrirlo.</Text>}
          </Card>
          <Card className={editorExpanded ? mergeClasses(styles.panel, styles.expandedPanel) : styles.panel}>
            <div className={styles.actions}>
              <Text weight="semibold">Texto extraído y editable</Text>
              <Button
                appearance="subtle"
                icon={editorExpanded ? <FullScreenMinimizeRegular /> : <FullScreenMaximizeRegular />}
                aria-label={editorExpanded ? 'Reducir editor de texto' : 'Ampliar editor de texto'}
                title={editorExpanded ? 'Reducir editor de texto' : 'Ampliar editor de texto'}
                onClick={() => setEditorExpanded((value) => !value)}
              />
            </div>
            <div>
              <Label htmlFor="document-title">Título del documento</Label>
              <Input
                id="document-title"
                value={title}
                onChange={(_event, data) => setTitle(data.value)}
                placeholder="Documento sin título"
                maxLength={200}
              />
            </div>
            {pages.length > 0 ? (
              <div className={styles.pageList}>
                {pages.map((page, index) => (
                  <div key={index}>
                    <Label htmlFor={`document-page-${index}`}>Página {index + 1}</Label>
                    <Textarea
                      id={`document-page-${index}`}
                      className={styles.pageEditor}
                      value={page}
                      onChange={(_event, data) => {
                        setPages((currentPages) => currentPages.map((currentPage, pageIndex) => (
                          pageIndex === index ? data.value : currentPage
                        )));
                      }}
                      placeholder={`Texto extraído de la página ${index + 1}`}
                      resize="vertical"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Text>El texto extraído aparecerá aquí, separado por páginas.</Text>
            )}
            <Text size={200} className={styles.status} role="status">{status}</Text>
            {error && <Text role="alert" style={{ color: tokens.colorPaletteRedForeground1 }}>{error}</Text>}
          </Card>
      </div>
      <div className={styles.actions}>
        <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
          DOCX, XLSX, PPTX y PDF conservan cada página original como imagen junto al texto editable. TXT solo conserva el texto.
        </Text>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Dropdown
            aria-label="Formato de exportación"
            value={format}
            selectedOptions={[format]}
            onOptionSelect={(_event, data) => {
              if (data.optionValue) setFormat(data.optionValue as OutputFormat);
            }}
          >
            <Option value="DOCX">DOCX</Option>
            <Option value="XLSX">XLSX</Option>
            <Option value="PPTX">PPTX</Option>
            <Option value="TXT">TXT</Option>
          </Dropdown>
          <Button
            appearance="primary"
            icon={<SaveRegular />}
            disabled={!title.trim() || !content.trim() || saving || loadingPdf}
            onClick={saveAsFormat}
          >
            {saving ? 'Guardando…' : `Guardar como ${format}`}
          </Button>
          <Button
            icon={<SaveRegular />}
            disabled={!title.trim() || !content.trim() || saving || loadingPdf}
            onClick={saveAsPdf}
          >
            Guardar como PDF
          </Button>
        </div>
      </div>
      {status && <Text role="status">{status}</Text>}
      {error && <Text role="alert" style={{ color: tokens.colorPaletteRedForeground1 }}>{error}</Text>}
    </main>
  );
}
