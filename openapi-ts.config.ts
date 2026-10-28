import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  // Pinned local snapshot of the backend spec (copy of the backend's openapi-schema.json).
  // Update it deliberately and review the diff; never generate types from a live URL.
  input: './openapi/openapi.json',
  output: './infrastructure/api',
  plugins: ['@hey-api/typescript'],
});
