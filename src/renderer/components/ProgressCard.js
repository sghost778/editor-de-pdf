import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, ProgressBar, Text, makeStyles, tokens } from '@fluentui/react-components';
const useStyles = makeStyles({
    card: {
        display: 'grid',
        gap: '8px',
        alignContent: 'center',
        padding: '16px',
        borderRadius: '16px',
        background: '#FFFFFF',
    },
});
export function ProgressCard({ label, value }) {
    const styles = useStyles();
    return (_jsxs(Card, { className: styles.card, children: [_jsx(Text, { weight: "semibold", children: label }), _jsx(ProgressBar, { value: value }), _jsxs(Text, { size: 200, style: { color: tokens.colorNeutralForeground2 }, children: [value, "% complete"] })] }));
}
