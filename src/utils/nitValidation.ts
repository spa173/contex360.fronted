const NIT_WEIGHTS = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71]

export function validateNit(nit: string): boolean {
  const match = nit.match(/^(\d+)-\d$/)
  if (!match) return false
  const base = match[1]
  const providedDigit = parseInt(nit.slice(-1), 10)
  const digits = base.split('').map(Number)
  let sum = 0
  for (let i = digits.length - 1, w = 0; i >= 0; i--, w++) {
    sum += digits[i] * NIT_WEIGHTS[w % NIT_WEIGHTS.length]
  }
  const expected = (11 - (sum % 11)) % 11
  if (expected === 10) return false
  return providedDigit === expected
}
