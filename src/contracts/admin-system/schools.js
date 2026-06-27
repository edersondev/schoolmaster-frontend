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

export function mapSchool(record) {
  return mapCommonRecord(record)
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
