function normalizeApiBaseUrl(value: string) {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

export function getApiBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL
  if (!raw) throw new Error('VITE_API_BASE_URL environment variable is required')
  return normalizeApiBaseUrl(raw)
}
