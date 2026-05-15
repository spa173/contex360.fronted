const LOCAL_API_BASE_URL = 'http://localhost:3001'
const PRODUCTION_API_BASE_URL = 'https://contex360-backend-production-2b1d.up.railway.app'

function normalizeApiBaseUrl(value: string) {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

function resolveDefaultApiBaseUrl() {
  if (typeof window === 'undefined') {
    return LOCAL_API_BASE_URL
  }

  const hostname = window.location.hostname
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
    return LOCAL_API_BASE_URL
  }

  return PRODUCTION_API_BASE_URL
}

export function getApiBaseUrl() {
  let raw = String(import.meta.env.VITE_API_BASE_URL || resolveDefaultApiBaseUrl())
  
  // Auto-fix: if the URL still points to Render, force the Railway URL
  if (raw.includes('onrender.com')) {
    raw = PRODUCTION_API_BASE_URL
  }
  
  return normalizeApiBaseUrl(raw)
}
