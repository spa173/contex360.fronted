<script setup lang="ts">
/**
 * MockClients — coded recreation of the third-parties / clients directory.
 * Mirrors ThirdPartiesView: avatar, name, NIT and account-status pill.
 */
const clients = [
  { name: 'Distribuidora Andina', nit: '901.455.318', initials: 'DA', color: '#2563EB', state: 'Al día', ok: true },
  { name: 'Constructora Bolívar', nit: '860.002.964', initials: 'CB', color: '#7C3AED', state: 'Al día', ok: true },
  { name: 'Mercados del Norte', nit: '900.781.220', initials: 'MN', color: '#d97706', state: 'Por cobrar', ok: false },
]
</script>

<template>
  <div class="cli">
    <div
      v-for="c in clients"
      :key="c.nit"
      class="cli__row"
    >
      <span
        class="cli__avatar"
        :style="{ background: c.color }"
        aria-hidden="true"
      >{{ c.initials }}</span>
      <span class="cli__info">
        <span class="cli__name">{{ c.name }}</span>
        <span class="cli__nit">NIT {{ c.nit }}</span>
      </span>
      <span
        class="cli__state"
        :class="c.ok ? 'cli__state--ok' : 'cli__state--due'"
      >{{ c.state }}</span>
    </div>
  </div>
</template>

<style scoped>
.cli { font-size: 12px; display: flex; flex-direction: column; }
.cli__row { display: grid; grid-template-columns: auto 1fr auto; gap: 0.65rem; align-items: center; padding: 0.6rem 0; border-bottom: 1px solid #F7F7F8; }
.cli__row:last-child { border-bottom: none; }
.cli__avatar { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 11px; font-weight: 800; flex-shrink: 0; }
.cli__info { display: flex; flex-direction: column; min-width: 0; }
.cli__name { font-weight: 700; color: #18181B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cli__nit { font-size: 10.5px; color: #A1A1AA; font-family: ui-monospace, monospace; }
.cli__state { font-size: 10.5px; font-weight: 700; padding: 0.25rem 0.55rem; border-radius: 9999px; white-space: nowrap; }
.cli__state--ok { color: #15803d; background: rgba(22,163,74,0.09); }
.cli__state--due { color: #d97706; background: rgba(217,119,6,0.1); }
</style>
