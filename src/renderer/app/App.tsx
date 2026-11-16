import {
  Button,
  FluentProvider,
  makeStyles,
  Text,
  Title3,
  tokens,
} from '@fluentui/react-components';
import { HashRouter, Route, Routes, useNavigate } from 'react-router-dom';

import { appRoutes } from './routes';
import { appTheme } from '../styles/theme';

const useStyles = makeStyles({
  page: {
    minHeight: '100vh',
    background: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    fontFamily: 'Segoe UI Variable, Segoe UI, sans-serif',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 30px',
    background: '#ffffff',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
});

export function App() {
  const styles = useStyles();

  return (
    <FluentProvider theme={appTheme}>
      <HashRouter>
        <div className={styles.page}>
          <AppContent styles={styles} />
        </div>
      </HashRouter>
    </FluentProvider>
  );
}

function AppContent({ styles }: { styles: ReturnType<typeof useStyles> }) {
  const navigate = useNavigate();
  return (
    <>
      <header className={styles.topBar}>
        <div>
          <Title3 as="h1">Convertidor de PDF</Title3>
          <Text size={200} as="p">Edición privada de documentos y exportación a PDF</Text>
        </div>
        <Button appearance="primary" onClick={() => navigate('/editor')}>Editar y exportar PDF</Button>
      </header>
      <Routes>
        {appRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
      </Routes>
    </>
  );
}
