export function normalizeCnpj(value) {
  return String(value ?? '').replace(/\D/g, '').slice(0, 14)
}

export function formatCnpj(value) {
  const digits = normalizeCnpj(value)
  if (!digits) return ''

  const firstBlock = digits.slice(0, 2)
  const secondBlock = digits.slice(2, 5)
  const thirdBlock = digits.slice(5, 8)
  const branch = digits.slice(8, 12)
  const checkDigits = digits.slice(12, 14)

  if (digits.length <= 2) return firstBlock
  if (digits.length <= 5) return `${firstBlock}.${secondBlock}`
  if (digits.length <= 8) return `${firstBlock}.${secondBlock}.${thirdBlock}`
  if (digits.length <= 12) return `${firstBlock}.${secondBlock}.${thirdBlock}/${branch}`
  return `${firstBlock}.${secondBlock}.${thirdBlock}/${branch}-${checkDigits}`
}

export function isValidCnpj(value) {
  const digits = normalizeCnpj(value)

  if (!/^\d{14}$/.test(digits)) return false
  if (/^(\d){13}$/.test(digits)) return false

  return checkDigit(digits.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(digits[12])
    && checkDigit(digits.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(digits[13])
}

function checkDigit(base, weights) {
  const sum = weights.reduce((total, weight, index) => total + Number(base[index]) * weight, 0)
  const remainder = sum % 11
  return remainder < 2 ? 0 : 11 - remainder
}
