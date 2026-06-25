import { compactPayload, mapCommonRecord } from './administration'

export function createGuardianForm() {
  return {
    fullName: '',
    relationshipType: '',
    contactEmail: '',
    contactPhone: '',
    studentProfileIds: [],
  }
}

export function mapGuardian(record) {
  return mapCommonRecord(record)
}

export function mapStudentProfileOption(record) {
  const mapped = mapCommonRecord(record)
  return {
    ...mapped,
    label: `${mapped.fullName} · ${mapped.registrationNumber}`,
  }
}

export function mapGuardianCreateRequest(form) {
  return compactPayload({
    full_name: form.fullName,
    relationship_type: form.relationshipType,
    contact_email: form.contactEmail,
    contact_phone: form.contactPhone,
    student_profile_ids: form.studentProfileIds?.length ? [...form.studentProfileIds] : undefined,
  })
}
