// theme.js – maneja tema claro/oscuro y migración de esquema
(() => {
  // Tema (light / dark)
  const stored = localStorage.getItem('contex360-theme');
  const theme = (stored === 'light' || stored === 'dark') ? stored : 'light';
  document.documentElement.classList.add(theme);
  document.documentElement.classList.remove(theme === 'dark' ? 'light' : 'dark');
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
})();
(() => {
  // Migración de versión de esquema
  const SCHEMA_VERSION = 'v2';
  const CURRENT_VERSION = localStorage.getItem('contex360_schema_version');
  if (CURRENT_VERSION !== SCHEMA_VERSION) {
    // Solo recargamos si hay datos de estado persistidos de versiones anteriores
    const hasOldData = Object.keys(localStorage).some(key => key.startsWith('contex360') && key !== 'contex360-theme');
    if (hasOldData) {
      localStorage.clear();
      localStorage.setItem('contex360_schema_version', SCHEMA_VERSION);
      window.location.reload();
    } else {
      localStorage.setItem('contex360_schema_version', SCHEMA_VERSION);
    }
  }
})();
