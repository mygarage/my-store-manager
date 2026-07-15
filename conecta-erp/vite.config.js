import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' genera rutas de assets RELATIVAS en el build.
// Esto permite que el proyecto funcione en GitHub Pages sin importar
// si se publica en la raíz del dominio (usuario.github.io) o en un
// subdirectorio (usuario.github.io/nombre-repo/) — no hay que tocar nada.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
