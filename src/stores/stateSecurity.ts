function bytesToHex(bytes: Uint8Array | number[]) {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('')
}

function getSecureRandomValues(length: number) {
  if (typeof globalThis === 'undefined' || !globalThis.crypto?.getRandomValues) {
    throw new Error('El navegador actual no soporta generacion segura de secretos.')
  }

  const bytes = new Uint8Array(length)
  globalThis.crypto.getRandomValues(bytes)
  return bytes
}

function pickRandomChar(alphabet: string) {
  const [byte] = getSecureRandomValues(1)
  return alphabet[byte % alphabet.length]
}

function shuffleChars(chars: string[]) {
  const bytes = getSecureRandomValues(chars.length)
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = bytes[i] % (i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
}

function generateSecureToken(length: number, alphabet: string) {
  if (length <= 0 || !alphabet) {
    return ''
  }

  return Array.from({ length }, () => pickRandomChar(alphabet)).join('')
}

const TEMP_PASSWORD_GROUPS = [
  'ABCDEFGHJKLMNPQRSTUVWXYZ',
  'abcdefghijkmnpqrstuvwxyz',
  '23456789',
  '!@#$%&*?',
]

const RECOVERY_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function createPasswordSalt() {
  return generateSecureToken(32, '0123456789abcdef')
}

async function hashPassword(secret: string, salt: string) {
  /* c8 ignore next 3 */
  if (typeof globalThis === 'undefined' || !globalThis.crypto?.subtle) {
    throw new Error('El navegador actual no soporta hashing seguro para credenciales.')
  }

  const payload = new TextEncoder().encode(`${salt}:${secret}`)
  const digest = await globalThis.crypto.subtle.digest('SHA-256', payload)
  return bytesToHex(new Uint8Array(digest))
}

export async function createPasswordCredentials(secret: string) {
  const passwordSalt = createPasswordSalt()
  const passwordHash = await hashPassword(secret, passwordSalt)

  return {
    passwordSalt,
    passwordHash,
  }
}

function serializeStateSnapshot(sourceState: any) {
  const snapshot = JSON.parse(JSON.stringify(sourceState))
  snapshot.users = snapshot.users.map((user: any) => {
    const sanitizedUser = { ...user }

    delete sanitizedUser.password

    return sanitizedUser
  })

  return snapshot
}


export function generateTemporaryPassword(length = 16) {
  const targetLength = Math.max(length, TEMP_PASSWORD_GROUPS.length)
  const passwordChars = TEMP_PASSWORD_GROUPS.map((group) => pickRandomChar(group))
  const alphabet = TEMP_PASSWORD_GROUPS.join('')

  while (passwordChars.length < targetLength) {
    passwordChars.push(pickRandomChar(alphabet))
  }

  shuffleChars(passwordChars)
  return passwordChars.join('')
}

export function generateRecoveryCode(length = 10) {
  return generateSecureToken(length, RECOVERY_CODE_ALPHABET)
}

// La verificación de contraseñas siempre se realiza en el backend (POST /auth/login).
// No existe verificación client-side para evitar exponer hashes o texto plano
// al contexto de ejecución del navegador.
