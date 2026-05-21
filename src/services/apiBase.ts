function normalizeApiBaseUrl(value: string) {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

export function getApiBaseUrl() {
  const raw = String(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001')
  return normalizeApiBaseUrl(raw)
}
