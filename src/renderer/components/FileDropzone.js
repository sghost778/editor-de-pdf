import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Caption1, makeStyles, Text, tokens, } from '@fluentui/react-components';
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
    return (_jsxs("div", { className: styles.root, children: [_jsx("div", { className: styles.icon, children: _jsx(DocumentRegular, { fontSize: 20 }) }), _jsxs("div", { children: [_jsx(Text, { weight: "semibold", children: "Drop a PDF here" }), _jsx(Caption1, { children: "Batch import supports DOCX, XLSX, PPTX, and TXT outputs." })] }), _jsx(Button, { appearance: "primary", icon: _jsx(ArrowUploadRegular, {}), children: "Add file" })] }));
}
