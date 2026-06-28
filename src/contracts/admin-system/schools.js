import { compactPayload, isPresent, isValidEmail, mapCommonRecord } from './administration'

const requiredAddressMessages = Object.freeze({
  zipCode: 'ZIP code is required.',
  street: 'Street is required.',
  number: 'Number is required.',
  neighborhood: 'Neighborhood is required.',
  city: 'City is required.',
  state: 'State is required.',
  country: 'Country is required.',
})

export function createAddressForm() {
  return {
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  }
}

export function createSchoolForm() {
  return {
    name: '',
    code: '',
    contactEmail: '',
    contactPhone: '',
    address: createAddressForm(),
    removeAddress: false,
  }
}

export function createSchoolDeleteForm(now = new Date()) {
  return {
    effectiveAt: formatDateInput(now),
    reason: '',
  }
}

export function validateSchoolForm(form = {}) {
  const errors = {}

  if (!isPresent(form.name)) {
    errors.name = ['School name is required.']
  }

  if (!isPresent(form.code)) {
    errors.code = ['School code is required.']
  }

  if (isPresent(form.contactEmail) && !isValidEmail(form.contactEmail)) {
    errors.contact_email = ['Enter a valid email address.']
  }

  if (!form.removeAddress) {
    for (const field of ['zipCode', 'street', 'number', 'neighborhood', 'city', 'state', 'country']) {
      if (!isPresent(form.address?.[field])) {
        errors[`address.${toSnakeCase(field)}`] = [requiredAddressMessages[field]]
      }
    }

    if (isPresent(form.address?.number) && !/^\d+$/.test(String(form.address.number))) {
      errors['address.number'] = ['Use numbers only.']
    }

    if (isPresent(form.address?.zipCode) && !/^\d+$/.test(String(form.address.zipCode))) {
      errors['address.zip_code'] = ['Use numbers only.']
    }
  }

  return errors
}

export function validateSchoolDeleteForm(form = {}) {
  const errors = {}

  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(form.effectiveAt ?? ''))) {
    errors.effective_at = ['Effective date is required.']
  }

  const reason = String(form.reason ?? '').trim()
  if (!reason) {
    errors.reason = ['Reason is required.']
  } else if (reason.length > 500) {
    errors.reason = ['Reason must be 500 characters or fewer.']
  }

  return errors
}

export function mapSchool(record) {
  return mapCommonRecord(record)
}

export function mapSchoolForm(record = {}) {
  return {
    ...createSchoolForm(),
    name: record.name ?? '',
    code: record.code ?? '',
    status: record.status ?? 'active',
    contactEmail: record.contactEmail ?? '',
    contactPhone: record.contactPhone ?? '',
    address: {
      ...createAddressForm(),
      ...(record.address ?? {}),
    },
    removeAddress: false,
  }
}

export function mapSchoolCreateRequest(form) {
  return compactPayload({
    name: form.name,
    code: form.code,
    contact_email: form.contactEmail,
    contact_phone: String(form.contactPhone ?? '').replace(/\D/g, ''),
    address: mapAddressInput(form.address),
  })
}

export function mapSchoolUpdateRequest(form) {
  const payload = compactPayload({
    name: form.name,
    status: form.status,
    contact_email: form.contactEmail,
    contact_phone: String(form.contactPhone ?? '').replace(/\D/g, ''),
  })

  if (form.removeAddress) {
    payload.address = null
  } else {
    const address = mapAddressInput(form.address)
    if (address) {
      payload.address = address
    }
  }

  return payload
}

export function mapSchoolDeleteRequest(form) {
  return {
    effective_at: String(form.effectiveAt ?? ''),
    reason: String(form.reason ?? '').trim(),
  }
}

function mapAddressInput(address) {
  if (!hasAddressInput(address)) return undefined

  return compactPayload({
    street: address.street,
    number: String(address.number ?? '').replace(/\D/g, ''),
    complement: address.complement,
    neighborhood: address.neighborhood,
    city: address.city,
    state: address.state,
    zip_code: String(address.zipCode ?? '').replace(/\D/g, ''),
    country: address.country,
  })
}

function hasAddressInput(address = {}) {
  return Object.values(address ?? {}).some(isPresent)
}

function toSnakeCase(value) {
  return String(value).replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

function formatDateInput(value) {
  const date = value instanceof Date ? value : new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
