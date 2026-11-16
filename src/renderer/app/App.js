import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button, FluentProvider, makeStyles, Text, Title3, tokens, } from '@fluentui/react-components';
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
    return (_jsx(FluentProvider, { theme: appTheme, children: _jsx(HashRouter, { children: _jsx("div", { className: styles.page, children: _jsx(AppContent, { styles: styles }) }) }) }));
}
function AppContent({ styles }) {
    const navigate = useNavigate();
    return (_jsxs(_Fragment, { children: [_jsxs("header", { className: styles.topBar, children: [_jsxs("div", { children: [_jsx(Title3, { as: "h1", children: "PDF Converter" }), _jsx(Text, { size: 200, as: "p", children: "Private, local document editing and PDF export" })] }), _jsx(Button, { appearance: "primary", onClick: () => navigate('/editor'), children: "Edit & export PDF" })] }), _jsx(Routes, { children: appRoutes.map(({ path, element }) => (_jsx(Route, { path: path, element: element }, path))) })] }));
}
