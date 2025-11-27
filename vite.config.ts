import { reactRouter } from '@react-router/dev/vite';
import autoprefixer from 'autoprefixer';
import path from 'node:path';
import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
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
});
