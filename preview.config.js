import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from '@previewjs/config';

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
  wrapper: {
    path: '__previewjs__/Wrapper.vue',
    componentName: 'Wrapper',
  },
});
