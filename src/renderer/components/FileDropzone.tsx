import {
  Button,
  Caption1,
  makeStyles,
  Text,
  tokens,
} from '@fluentui/react-components';
import { ArrowUploadRegular, DocumentRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    border: `1px dashed ${tokens.colorNeutralStroke2}`,
    borderRadius: '14px',
    padding: '18px 20px',
    background: '#FFFFFF',
    width: '100%',
  },
  icon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#EAF2FF',
    color: tokens.colorBrandForeground1,
  },
});

export function FileDropzone() {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <div className={styles.icon}>
        <DocumentRegular fontSize={20} />
      </div>
      <div>
        <Text weight="semibold">Suelta un PDF aquí</Text>
        <Caption1>Puedes exportar el contenido a DOCX, XLSX, PPTX o TXT.</Caption1>
      </div>
      <Button appearance="primary" icon={<ArrowUploadRegular />}>
        Añadir archivo
      </Button>
    </div>
  );
}
