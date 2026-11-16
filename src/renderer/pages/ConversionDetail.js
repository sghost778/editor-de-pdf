import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Button, Card, makeStyles, Text, Title2, tokens } from '@fluentui/react-components';
import { EditRegular } from '@fluentui/react-icons';
import { useNavigate, useParams } from 'react-router-dom';
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
    const [job, setJob] = useState(null);
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        let active = true;
        if (!window.pdfConverter) {
            setLoaded(true);
            return () => { active = false; };
        }
        window.pdfConverter.getJob(id)
            .then((result) => { if (active)
            setJob(result); })
            .catch(() => { if (active)
            setJob(null); })
            .finally(() => { if (active)
            setLoaded(true); });
        return () => { active = false; };
    }, [id]);
    return (_jsxs("main", { className: styles.shell, children: [_jsx(Text, { size: 300, children: "Conversion detail" }), job ? (_jsxs(Card, { className: styles.panel, children: [_jsx(Title2, { as: "h2", children: job.fileName }), _jsxs(Text, { children: ["Output format: ", job.outputFormat] }), _jsxs(Text, { children: ["OCR requested: ", job.ocrEnabled ? 'Yes' : 'No'] }), _jsxs(Text, { children: ["Status: ", job.status, " (", job.progress, "%)"] }), _jsxs(Text, { children: ["Output path: ", job.outputPath] }), _jsx(Button, { appearance: "primary", icon: _jsx(EditRegular, {}), onClick: () => navigate('/editor'), children: "Open editor & export PDF" })] })) : (_jsxs(Card, { className: styles.panel, children: [_jsx(Title2, { as: "h2", children: loaded ? 'Job not found' : 'Loading job…' }), loaded && _jsxs(Text, { children: ["This local app has no conversion record for \u201C", id, "\u201D."] }), _jsx(Button, { appearance: "primary", onClick: () => navigate('/editor'), children: "Open editor & export PDF" })] }))] }));
}
