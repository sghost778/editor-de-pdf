import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  main: {
    build: {
      outDir: 'dist/main',
      emptyOutDir: true,
      lib: {
        entry: 'src/main/electron/main.ts',
        formats: ['cjs'],
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    build: {
      outDir: 'dist/preload',
      emptyOutDir: true,
      lib: {
        entry: 'src/main/electron/preload.ts',
        formats: ['cjs'],
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    root: 'src/renderer',
    plugins: [react()],
    build: {
      outDir: '../../dist/renderer',
      emptyOutDir: true,
    },
  },
});
