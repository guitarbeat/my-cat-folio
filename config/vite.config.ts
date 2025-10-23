import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const resolveFromRoot = (...segments) => path.resolve(projectRoot, ...segments);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, '');

  const serverPort = Number(env.VITE_PORT) || 5173;
  const previewPort = Number(env.VITE_PREVIEW_PORT) || 4173;

  return {
    plugins: [react()],
    envPrefix: ['VITE_', 'SUPABASE_'],
    resolve: {
      alias: {
        '@': resolveFromRoot('src'),
        '@components': resolveFromRoot('src/shared/components'),
        '@hooks': resolveFromRoot('src/core/hooks'),
        '@utils': resolveFromRoot('src/shared/utils'),
        '@services': resolveFromRoot('src/shared/services'),
        '@styles': resolveFromRoot('src/shared/styles'),
        '@features': resolveFromRoot('src/features'),
        '@core': resolveFromRoot('src/core')
      },
      // Ensure a single React instance to avoid hooks dispatcher being null
      dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime']
    },
    optimizeDeps: {
      include: ['react', 'react-dom']
    },
    server: {
      host: true,
      port: serverPort
    },
    preview: {
      host: true,
      port: previewPort
    },
    build: {
      outDir: resolveFromRoot('dist'),
      emptyOutDir: true,
      sourcemap: mode !== 'production'
    }
  };
});
