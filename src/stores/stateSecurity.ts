function bytesToHex(bytes: Uint8Array | number[]) {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('')
}

function createPasswordSalt() {
  if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
    return bytesToHex(globalThis.crypto.getRandomValues(new Uint8Array(16)))
  }

  return `${Date.now().toString(16)}${Date.now().toString(16).slice(-8)}`
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

export function serializeStateSnapshot(sourceState: any) {
  const snapshot = JSON.parse(JSON.stringify(sourceState))
  snapshot.users = snapshot.users.map((user: any) => {
    const sanitizedUser = { ...user }

    if (sanitizedUser.passwordHash) {
      delete sanitizedUser.password
    }

    return sanitizedUser
  })

  return snapshot
}

export async function upgradeLegacyUserSecrets(user: any) {
  if (!user?.password || user.passwordHash) {
    return false
  }

  const credentials = await createPasswordCredentials(user.password)
  user.passwordSalt = credentials.passwordSalt
  user.passwordHash = credentials.passwordHash
  delete user.password
  return true
}

export async function verifyPassword(user: any, secret: string) {
  if (user.passwordHash && user.passwordSalt) {
    return (await hashPassword(secret, user.passwordSalt)) === user.passwordHash
  }

  return user.password === secret
}
