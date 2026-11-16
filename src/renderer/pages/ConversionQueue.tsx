import { useEffect, useState } from 'react';
import { Button, Card, makeStyles, Text, Title2, tokens } from '@fluentui/react-components';
import { EditRegular } from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';

import { FileJob } from '../../shared/file-types';
import { JobList } from '../components/JobList';

const useStyles = makeStyles({
  shell: {
    maxWidth: '1180px',
    margin: '0 auto',
    padding: '30px 24px 48px',
    display: 'grid',
    gap: '22px',
  },
  hero: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '18px',
    padding: '24px',
    background: '#FFFFFF',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '16px',
  },
  panel: {
    padding: '22px',
    display: 'grid',
    gap: '12px',
    background: '#FFFFFF',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '16px',
  },
  muted: { color: tokens.colorNeutralForeground2 },
});

function serviceStatus(value: string | undefined) {
  const labels: Record<string, string> = {
    available: 'disponible',
    available_on_scanned_pages: 'disponible en páginas escaneadas',
    healthy: 'activo',
    not_implemented: 'no implementado',
  };
  return value ? labels[value] ?? value : 'desconocido';
}

export function ConversionQueue() {
  const styles = useStyles();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<FileJob[]>([]);
  const [health, setHealth] = useState('Comprobando los servicios locales…');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!window.pdfConverter) {
      setHealth('Abre esta aplicación en Electron para usar los servicios locales.');
      return () => { active = false; };
    }
    Promise.all([window.pdfConverter.health(), window.pdfConverter.listJobs()])
      .then(([result, currentJobs]) => {
        if (!active) return;
        setHealth(`Exportación a PDF: ${serviceStatus(result.services.pdfExport)} · Conversión de PDF: ${serviceStatus(result.services.conversionEngine)} · OCR: ${serviceStatus(result.services.ocrEngine)}`);
        setJobs(currentJobs);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setHealth('Servicios locales no disponibles.');
        setError(reason instanceof Error ? reason.message : 'No se pudo conectar con los servicios locales.');
      });
    return () => { active = false; };
  }, []);

  return (
    <main className={styles.shell}>
      <div className={styles.hero}>
        <div>
          <Title2 as="h2">Tus documentos</Title2>
          <Text className={styles.muted}>
            Edita el texto de tus documentos localmente y guarda un PDF listo para imprimir.
          </Text>
        </div>
        <Button appearance="primary" icon={<EditRegular />} onClick={() => navigate('/editor')}>
          Abrir editor
        </Button>
      </div>

      <Card className={styles.panel}>
        <Text weight="semibold">Funciones disponibles en este equipo</Text>
        <Text className={styles.muted}>{health}</Text>
        <Text>
        Abre un PDF, extrae el texto o aplica OCR a las páginas escaneadas, edita el resultado y guárdalo localmente como DOCX, XLSX, PPTX, TXT o PDF.
        </Text>
        {error && <Text role="alert">{error}</Text>}
      </Card>

      <section aria-labelledby="jobs-title" className={styles.panel}>
        <Title2 as="h3" id="jobs-title">Conversiones</Title2>
        {jobs.length
          ? <JobList jobs={jobs} />
          : <Text className={styles.muted}>No hay conversiones disponibles.</Text>}
      </section>
    </main>
  );
}
