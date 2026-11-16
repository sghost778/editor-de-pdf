import { Card, ProgressBar, Text, makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  card: {
    display: 'grid',
    gap: '8px',
    alignContent: 'center',
    padding: '16px',
    borderRadius: '16px',
    background: '#FFFFFF',
  },
});

export function ProgressCard({ label, value }: { label: string; value: number }) {
  const styles = useStyles();
  return (
    <Card className={styles.card}>
      <Text weight="semibold">{label}</Text>
      <ProgressBar value={value} />
      <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>{value}% completado</Text>
    </Card>
  );
}
