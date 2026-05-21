const CSRF_COOKIE = 'contex360-csrf-token'

/**
 * Lee el token CSRF de la cookie que el backend emite después del login.
 * La cookie NO es httpOnly → el frontend puede leerla para incluirla
 * como header X-CSRF-Token en requests mutantes (Double Submit Cookie pattern).
 */
export function getCsrfToken(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${CSRF_COOKIE}=`))
  return match ? match.slice(CSRF_COOKIE.length + 1) : ''
}
