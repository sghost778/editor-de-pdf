import { jsx as _jsx } from "react/jsx-runtime";
import { ConversionDetail } from '../pages/ConversionDetail';
import { ConversionQueue } from '../pages/ConversionQueue';
import { EditorExport } from '../pages/EditorExport';
export const appRoutes = [
    { path: '/', element: _jsx(ConversionQueue, {}) },
    { path: '/jobs/:id', element: _jsx(ConversionDetail, {}) },
    { path: '/editor', element: _jsx(EditorExport, {}) },
];
