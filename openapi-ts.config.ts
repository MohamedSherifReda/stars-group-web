import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'https://starsgroup.wecodeforyou.io/docs-json',
  output: './infrastructure/api',
  plugins: ['@hey-api/typescript'],
});
