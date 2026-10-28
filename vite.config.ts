import { reactRouter } from '@react-router/dev/vite';
import autoprefixer from 'autoprefixer';
import path from 'node:path';
import tailwindcss from 'tailwindcss';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ command, mode }) => {
  // Production builds must know the API origin; there is no hardcoded fallback host.
  if (command === 'build' && mode === 'production') {
    const env = { ...loadEnv(mode, process.cwd(), 'VITE_'), ...process.env };
    if (!env.VITE_BASE_URL) {
      throw new Error('VITE_BASE_URL must be set for production builds (e.g. https://api.example.com/)');
    }
  }
  return {
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  plugins: [reactRouter(), tsconfigPaths()],

  server: {
    host: true,
    port: 3002,
  },
  preview: {
    allowedHosts: ['cms.starsgroup.wecodeforyou.io'],
    port: 5000,
    host: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@root': path.resolve(__dirname, './'),
    },
  },
};
});
