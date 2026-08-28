import { Mask } from 'maska'

export const PHONE_MASK = '(##) #####-####'

const phoneMask = new Mask({ mask: PHONE_MASK })

export function normalizePhone(value) {
  return String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, 11)
}

export function formatPhone(value) {
  const digits = normalizePhone(value)
  return digits ? phoneMask.masked(digits) : ''
}
