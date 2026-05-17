import { defineConfig } from '@previewjs/config';
import { createPinia } from 'pinia';
import { createMemoryHistory, createRouter } from 'vue-router';

export default defineConfig({
  wrapper: {
    vue: () => {
      const pinia = createPinia();
      const router = createRouter({
        history: createMemoryHistory(),
        routes: [],
      });
      return {
        plugins: [pinia, router],
      };
    },
  },
});
