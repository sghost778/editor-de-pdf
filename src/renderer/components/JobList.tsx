import { Badge, Card, Text, makeStyles, tokens } from '@fluentui/react-components';
import { useNavigate } from 'react-router-dom';

import { FileJob } from '../../shared/file-types';

const useStyles = makeStyles({
  card: {
    width: '100%',
    padding: '18px 20px',
    display: 'grid',
    gap: '8px',
    background: '#FFFFFF',
    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)',
    borderRadius: '16px',
    cursor: 'pointer',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 0.8fr 1fr',
    gap: '12px',
    alignItems: 'center',
    padding: '4px 0',
  },
});

export function JobList({ jobs }: { jobs: FileJob[] }) {
  const styles = useStyles();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      {jobs.map((job) => (
        <Card key={job.id} className={styles.card} onClick={() => navigate(`/jobs/${job.id}`)}>
          <div className={styles.row}>
            <Text weight="semibold">{job.fileName}</Text>
            <Text>{job.outputFormat}</Text>
            <Text>{job.ocrEnabled ? 'OCR' : 'Estándar'}</Text>
            <Badge appearance={job.status === 'completed' ? 'tint' : 'outline'} color={job.status === 'completed' ? 'success' : 'important'}>
              {job.status === 'completed'
                ? 'Listo'
                : job.status === 'needs_review'
                  ? 'Requiere revisión'
                  : job.status === 'queued'
                    ? 'En cola'
                    : job.status === 'running'
                      ? 'En proceso'
                      : job.status === 'failed'
                        ? 'Error'
                        : job.status}
            </Badge>
          </div>
          <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
            {job.progress}% completado · Guardar en {job.outputPath}
          </Text>
        </Card>
      ))}
    </div>
  );
}
