import { JSX } from 'react';

import { ConversionDetail } from '../pages/ConversionDetail';
import { ConversionQueue } from '../pages/ConversionQueue';
import { EditorExport } from '../pages/EditorExport';

export const appRoutes: Array<{ path: string; element: JSX.Element }> = [
  { path: '/', element: <ConversionQueue /> },
  { path: '/jobs/:id', element: <ConversionDetail /> },
  { path: '/editor', element: <EditorExport /> },
];
