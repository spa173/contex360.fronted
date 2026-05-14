import CryptoJS from 'crypto-js'

const SECRET_KEY = import.meta.env.VITE_APP_SECRET || 'contex360-default-local-key-2026'

/**
 * Encrypts a string using AES
 */
export function encryptData(data: string): string {
  try {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString()
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
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY)
    return bytes.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('Decryption failed:', error)
    return ''
  }
}
