import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: './', // ✅ importantissimo per i percorsi relativi
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    build: {
      outDir: 'dist', // ✅ specifica la directory di output
      assetsDir: 'assets', // ✅ dove salvare JS/CSS
      emptyOutDir: true, // ✅ pulisce la vecchia dist prima del rebuild
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
