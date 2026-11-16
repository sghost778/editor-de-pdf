import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dropdown, Option, makeStyles, Text, tokens, } from '@fluentui/react-components';
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
    return (_jsxs("div", { className: styles.root, children: [_jsx(Text, { weight: "semibold", children: "Output format" }), _jsxs(Dropdown, { defaultValue: "DOCX", children: [_jsx(Option, { value: "DOCX", children: "DOCX" }), _jsx(Option, { value: "XLSX", children: "XLSX" }), _jsx(Option, { value: "PPTX", children: "PPTX" }), _jsx(Option, { value: "TXT", children: "TXT" })] })] }));
}
