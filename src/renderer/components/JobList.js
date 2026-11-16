import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Badge, Card, Text, makeStyles, tokens } from '@fluentui/react-components';
import { useNavigate } from 'react-router-dom';
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
export function JobList({ jobs }) {
    const styles = useStyles();
    const navigate = useNavigate();
    return (_jsx("div", { style: { display: 'grid', gap: '12px' }, children: jobs.map((job) => (_jsxs(Card, { className: styles.card, onClick: () => navigate(`/jobs/${job.id}`), children: [_jsxs("div", { className: styles.row, children: [_jsx(Text, { weight: "semibold", children: job.fileName }), _jsx(Text, { children: job.outputFormat }), _jsx(Text, { children: job.ocrEnabled ? 'OCR' : 'Standard' }), _jsx(Badge, { appearance: job.status === 'completed' ? 'tint' : 'outline', color: job.status === 'completed' ? 'success' : 'important', children: job.status === 'completed' ? 'Ready' : job.status === 'needs_review' ? 'Needs review' : job.status })] }), _jsxs(Text, { size: 200, style: { color: tokens.colorNeutralForeground2 }, children: [job.progress, "% complete \u2022 Save to ", job.outputPath] })] }, job.id))) }));
}
