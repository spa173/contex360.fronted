// Theme initialization (runs before Vue hydrates)
(function() {
  const stored = localStorage.getItem('contex360-theme')
  const theme = (stored === 'light' || stored === 'dark') ? stored : 'light'
  document.documentElement.classList.add(theme)
  document.documentElement.classList.remove(theme === 'dark' ? 'light' : 'dark')
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
})()

// Schema version check (clear cache if structure changed)
(function() {
  const SCHEMA_VERSION = 'v2'
  const CURRENT_VERSION = localStorage.getItem('contex360_schema_version')
  if (CURRENT_VERSION !== SCHEMA_VERSION) {
    localStorage.clear()
    localStorage.setItem('contex360_schema_version', SCHEMA_VERSION)
    window.location.reload()
  }
})()
