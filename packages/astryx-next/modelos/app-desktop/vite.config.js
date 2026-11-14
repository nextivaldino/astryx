import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Astryx-NEXT: copiado para ./astryx-next (modo "copiar") ou instalado em
// node_modules/astryx-next (modo "instalar"). O modo é detetado sozinho.
const copiado = fileURLToPath(new URL('./astryx-next', import.meta.url));

export default defineConfig({
  // O Astryx-NEXT vem em JSX: transformar também quando está em node_modules.
  plugins: [react({ exclude: /\/node_modules\/(?!astryx-next\/)/ })],
  resolve: {
    alias: existsSync(copiado) ? { 'astryx-next': copiado } : {},
    // Uma só cópia de React, Astryx e da fonte.
    dedupe: ['react', 'react-dom', '@astryxdesign/core', '@astryxdesign/theme-neutral', '@fontsource-variable/mona-sans'],
  },
  optimizeDeps: { exclude: ['astryx-next'] },
  server: { host: true },
});
