import { compactPayload, mapCommonRecord } from './administration'

export function createSchoolForm() {
  return { name: '', code: '', contactEmail: '', contactPhone: '', addressSummary: '' }
}

export function mapSchool(record) {
  return mapCommonRecord(record)
}

export function mapSchoolCreateRequest(form) {
  return compactPayload({
    name: form.name,
    code: form.code,
    contact_email: form.contactEmail,
    contact_phone: form.contactPhone,
    address_summary: form.addressSummary,
  })
}
