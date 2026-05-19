import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY_STORAGE = ['contex360', 'crypto', 'key', 'v2'].join('-')
const ENCRYPTED_VALUE_PREFIX = 'enc:'

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('')
}

function getEncryptionKey() {
  if (typeof globalThis === 'undefined' || !globalThis.localStorage || !globalThis.crypto?.getRandomValues) {
    return ''
  }

  const storedKey = globalThis.localStorage.getItem(ENCRYPTION_KEY_STORAGE)?.trim()
  if (storedKey) {
    return storedKey
  }

  const keyBytes = new Uint8Array(32)
  globalThis.crypto.getRandomValues(keyBytes)
  const generatedKey = bytesToHex(keyBytes)
  globalThis.localStorage.setItem(ENCRYPTION_KEY_STORAGE, generatedKey)
  return generatedKey
}

/**
 * Encrypts a string using AES
 */
export function encryptData(data: string): string {
  try {
    const key = getEncryptionKey()
    if (!key) {
      return data
    }

    return `${ENCRYPTED_VALUE_PREFIX}${CryptoJS.AES.encrypt(data, key).toString()}`
  } catch (error) {
    console.error('Encryption failed:', error)
    return data
  }
}

/**
 * Decrypts a string using AES
 */
export function decryptData(ciphertext: string): string {
  try {
    const value = String(ciphertext || '')
    if (!value) {
      return ''
    }

    if (!value.startsWith(ENCRYPTED_VALUE_PREFIX) && !value.startsWith('U2FsdGVkX1')) {
      return value
    }

    const key = getEncryptionKey()
    if (!key) {
      return ''
    }

    const encryptedValue = value.startsWith(ENCRYPTED_VALUE_PREFIX) ? value.slice(ENCRYPTED_VALUE_PREFIX.length) : value
    const bytes = CryptoJS.AES.decrypt(encryptedValue, key)
    return bytes.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('Decryption failed:', error)
    return ''
  }
}
