let encryptionKey: CryptoKey | null = null
let keyPromise: Promise<CryptoKey> | null = null

export async function initEncryptionKey() {
  if (encryptionKey) return
  if (keyPromise) return keyPromise
  keyPromise = crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  ).then(k => { encryptionKey = k; return k })
  return keyPromise
}

export function clearEncryptionKey() {
  encryptionKey = null
  keyPromise = null
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 8192
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.slice(i, i + chunk))
  }
  return btoa(binary)
}

function base64ToUint8(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export async function encryptData(data: string): Promise<string> {
  if (!encryptionKey) return data
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(data)
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    encryptionKey,
    encoded
  )
  const combined = new Uint8Array(iv.length + ciphertext.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(ciphertext), iv.length)
  return uint8ToBase64(combined)
}

export async function decryptData(encoded: string): Promise<string> {
  if (!encryptionKey) return encoded
  try {
    const combined = base64ToUint8(encoded)
    const iv = combined.slice(0, 12)
    const ciphertext = combined.slice(12)
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      encryptionKey,
      ciphertext
    )
    return new TextDecoder().decode(decrypted)
  } catch {
    return ''
  }
}
