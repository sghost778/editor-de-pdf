import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Button, Card, makeStyles, Text, Title2, tokens } from '@fluentui/react-components';
import { EditRegular } from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';
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
export function ConversionQueue() {
    const styles = useStyles();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [health, setHealth] = useState('Checking local services…');
    const [error, setError] = useState('');
    useEffect(() => {
        let active = true;
        if (!window.pdfConverter) {
            setHealth('Open this app in Electron to use its local services.');
            return () => { active = false; };
        }
        Promise.all([window.pdfConverter.health(), window.pdfConverter.listJobs()])
            .then(([result, currentJobs]) => {
            if (!active)
                return;
            setHealth(`PDF export: ${result.services.pdfExport ?? 'unknown'} · PDF conversion: ${result.services.conversionEngine ?? 'unknown'} · OCR: ${result.services.ocrEngine ?? 'unknown'}`);
            setJobs(currentJobs);
        })
            .catch((reason) => {
            if (!active)
                return;
            setHealth('Local services unavailable.');
            setError(reason instanceof Error ? reason.message : 'Could not connect to the local app services.');
        });
        return () => { active = false; };
    }, []);
    return (_jsxs("main", { className: styles.shell, children: [_jsxs("div", { className: styles.hero, children: [_jsxs("div", { children: [_jsx(Title2, { as: "h2", children: "Your documents" }), _jsx(Text, { className: styles.muted, children: "Edit document text locally and save a finished, printable PDF." })] }), _jsx(Button, { appearance: "primary", icon: _jsx(EditRegular, {}), onClick: () => navigate('/editor'), children: "Open editor" })] }), _jsxs(Card, { className: styles.panel, children: [_jsx(Text, { weight: "semibold", children: "Local capabilities" }), _jsx(Text, { className: styles.muted, children: health }), _jsx(Text, { children: "The editor and PDF export are available. PDF-to-DOCX/XLSX/PPTX/TXT conversion and OCR are not implemented yet; no conversion jobs are simulated or shown as complete." }), error && _jsx(Text, { role: "alert", children: error })] }), _jsxs("section", { "aria-labelledby": "jobs-title", className: styles.panel, children: [_jsx(Title2, { as: "h3", id: "jobs-title", children: "Conversion jobs" }), jobs.length
                        ? _jsx(JobList, { jobs: jobs })
                        : _jsx(Text, { className: styles.muted, children: "No conversion jobs are available." })] })] }));
}
