import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button, Card, Input, Label, makeStyles, Text, Textarea, Title2, tokens, } from '@fluentui/react-components';
import { ArrowLeftRegular, SaveRegular } from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';
const useStyles = makeStyles({
    shell: {
        maxWidth: '1180px',
        margin: '0 auto',
        padding: '30px 24px 48px',
        display: 'grid',
        gap: '20px',
    },
    columns: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        gap: '20px',
        '@media (max-width: 760px)': { gridTemplateColumns: '1fr' },
    },
    panel: {
        minHeight: '420px',
        padding: '22px',
        display: 'grid',
        alignContent: 'start',
        gap: '14px',
        background: '#FFFFFF',
        border: `1px solid ${tokens.colorNeutralStroke2}`,
        borderRadius: '16px',
    },
    textarea: { minHeight: '300px', width: '100%' },
    preview: {
        minHeight: '300px',
        padding: '24px',
        border: `1px solid ${tokens.colorNeutralStroke2}`,
        borderRadius: '8px',
        background: '#FFFFFF',
        whiteSpace: 'pre-wrap',
        overflowWrap: 'anywhere',
        lineHeight: '1.6',
    },
    actions: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' },
    status: { minHeight: '24px', color: tokens.colorNeutralForeground2 },
});
export function EditorExport() {
    const styles = useStyles();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    async function saveAsPdf() {
        setError('');
        setStatus('');
        setSaving(true);
        try {
            if (!window.pdfConverter) {
                throw new Error('PDF export is available only in the desktop app.');
            }
            const result = await window.pdfConverter.exportPdf({ title: title.trim(), content });
            if (result.canceled) {
                setStatus('PDF export cancelled. Your edits are still here.');
            }
            else if (result.filePath) {
                setStatus(`PDF saved: ${result.filePath}`);
            }
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : 'PDF export failed.');
        }
        finally {
            setSaving(false);
        }
    }
    return (_jsxs("main", { className: styles.shell, children: [_jsx(Button, { appearance: "subtle", icon: _jsx(ArrowLeftRegular, {}), onClick: () => navigate('/'), children: "Back to conversion queue" }), _jsxs("div", { children: [_jsx(Title2, { as: "h2", children: "Edit & export as PDF" }), _jsx(Text, { children: "Edit or paste document text below, preview it, then use Save as PDF to create a real PDF file on this device." })] }), _jsxs("div", { className: styles.columns, children: [_jsxs(Card, { className: styles.panel, children: [_jsx(Text, { weight: "semibold", children: "Document editor" }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "document-title", children: "Document title" }), _jsx(Input, { id: "document-title", value: title, onChange: (_event, data) => setTitle(data.value), placeholder: "Untitled document", maxLength: 200 })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "document-content", children: "Editable content" }), _jsx(Textarea, { id: "document-content", className: styles.textarea, value: content, onChange: (_event, data) => setContent(data.value), placeholder: "Type or paste the text you want in your final PDF\u2026", resize: "vertical" })] })] }), _jsxs(Card, { className: styles.panel, children: [_jsx(Text, { weight: "semibold", children: "PDF preview" }), _jsxs("div", { className: styles.preview, "aria-label": "Document preview", children: [_jsx("h1", { children: title.trim() || 'Untitled document' }), content || _jsx(Text, { children: "The preview will update as you edit." })] }), _jsx(Text, { size: 200, className: styles.status, role: "status", children: status }), error && _jsx(Text, { role: "alert", style: { color: tokens.colorPaletteRedForeground1 }, children: error })] })] }), _jsxs("div", { className: styles.actions, children: [_jsx(Text, { size: 200, style: { color: tokens.colorNeutralForeground2 }, children: "Your content is processed locally and is not uploaded." }), _jsx(Button, { appearance: "primary", icon: _jsx(SaveRegular, {}), disabled: !title.trim() || !content.trim() || saving, onClick: saveAsPdf, children: saving ? 'Preparing PDF…' : 'Save as PDF' })] })] }));
}
