import { defineConfig } from '@previewjs/config';
import { createPinia } from 'pinia';
import { createMemoryHistory, createRouter } from 'vue-router';
import './src/style.css';
import './src/assets/styles.css';

const pinia = createPinia();
const router = createRouter({
  history: createMemoryHistory(),
  routes: [],
});

export default defineConfig({
  wrapper: {
    vue: {
      plugins: [pinia, router]
    }
  }
});
