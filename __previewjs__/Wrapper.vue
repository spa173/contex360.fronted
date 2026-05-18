<template>
  <div class="preview-wrapper min-h-screen bg-white text-[#18181B] font-['Inter'] antialiased">
    <slot />
  </div>
</template>

<script>
import { createPinia, setActivePinia } from 'pinia';

const pinia = createPinia();
setActivePinia(pinia);

export default {
  name: 'Wrapper',
};
</script>

<script setup>
import { getCurrentInstance } from 'vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import '../src/style.css';
import '../src/assets/styles.css';

const app = getCurrentInstance()?.appContext?.app;
if (app) {
  try {
    app.use(pinia);
  } catch (err) {
    // Pinia may already be installed on this app instance
  }

  try {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [],
    });
    app.use(router);
  } catch (err) {
    // Router may already be installed on this app instance
  }
}
</script>
