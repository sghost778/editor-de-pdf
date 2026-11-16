import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  root: 'src/renderer',
  plugins: [react()],
  resolve: {
    extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx', '.json'],
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: false,
  },
  preview: {
    port: 4173,
    host: '0.0.0.0',
  },
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
  },
});
