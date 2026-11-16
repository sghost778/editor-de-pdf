import { useEffect, useState } from 'react';
import { Button, Card, makeStyles, Text, Title2, tokens } from '@fluentui/react-components';
import { EditRegular } from '@fluentui/react-icons';
import { useNavigate, useParams } from 'react-router-dom';

import { FileJob } from '../../shared/file-types';

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    completed: 'Completado',
    failed: 'Error',
    needs_review: 'Requiere revisión',
    processing: 'En proceso',
    queued: 'En cola',
  };
  return labels[status] ?? status;
}

const useStyles = makeStyles({
  shell: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '32px 24px 48px',
    display: 'grid',
    gap: '20px',
  },
  panel: {
    padding: '24px',
    display: 'grid',
    gap: '14px',
    background: '#FFFFFF',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: '16px',
  },
});

export function ConversionDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const styles = useStyles();
  const [job, setJob] = useState<FileJob | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    if (!window.pdfConverter) {
      setLoaded(true);
      return () => { active = false; };
    }
    window.pdfConverter.getJob(id)
      .then((result) => { if (active) setJob(result); })
      .catch(() => { if (active) setJob(null); })
      .finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, [id]);

  return (
    <main className={styles.shell}>
      <Text size={300}>Detalle de conversión</Text>
      {job ? (
        <Card className={styles.panel}>
          <Title2 as="h2">{job.fileName}</Title2>
          <Text>Formato de salida: {job.outputFormat}</Text>
          <Text>OCR solicitado: {job.ocrEnabled ? 'Sí' : 'No'}</Text>
          <Text>Estado: {statusLabel(job.status)} ({job.progress}%)</Text>
          <Text>Ruta de salida: {job.outputPath}</Text>
          <Button appearance="primary" icon={<EditRegular />} onClick={() => navigate('/editor')}>
            Abrir editor y exportar PDF
          </Button>
        </Card>
      ) : (
        <Card className={styles.panel}>
          <Title2 as="h2">{loaded ? 'No se encontró la conversión' : 'Cargando conversión…'}</Title2>
          {loaded && <Text>Esta aplicación no tiene un registro local para «{id}».</Text>}
          <Button appearance="primary" onClick={() => navigate('/editor')}>Abrir editor y exportar PDF</Button>
        </Card>
      )}
    </main>
  );
}
