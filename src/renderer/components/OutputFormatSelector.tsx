import {
  Dropdown,
  Option,
  makeStyles,
  Text,
  tokens,
} from '@fluentui/react-components';

const useStyles = makeStyles({
  root: {
    display: 'grid',
    gap: '8px',
    padding: '20px',
    background: '#FFFFFF',
    borderRadius: '16px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
});

export function OutputFormatSelector() {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <Text weight="semibold">Formato de salida</Text>
      <Dropdown defaultValue="DOCX">
        <Option value="DOCX">DOCX</Option>
        <Option value="XLSX">XLSX</Option>
        <Option value="PPTX">PPTX</Option>
        <Option value="TXT">TXT</Option>
      </Dropdown>
    </div>
  );
}
