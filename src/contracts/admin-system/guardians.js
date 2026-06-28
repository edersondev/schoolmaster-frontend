import {
  compactPayload,
  isPresent,
  isValidEmail,
  mapCommonRecord,
} from './administration'
import { projectUpdatePayload } from './lifecycle'

export function createGuardianForm() {
  return {
    fullName: '',
    relationshipType: '',
    contactEmail: '',
    contactPhone: '',
    studentProfileIds: [],
  }
}

export function validateGuardianForm(form = {}) {
  const errors = {}

  if (!isPresent(form.fullName)) {
    errors.full_name = ['Full name is required.']
  }

  if (!isPresent(form.relationshipType)) {
    errors.relationship_type = ['Relationship is required.']
  }

  if (isPresent(form.contactEmail) && !isValidEmail(form.contactEmail)) {
    errors.contact_email = ['Enter a valid email address.']
  }

  return errors
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

export function mapGuardianForm(record = {}) {
  return {
    fullName: record.fullName ?? '',
    relationshipType: record.relationshipType ?? '',
    contactEmail: record.contactEmail ?? '',
    contactPhone: record.contactPhone ?? '',
  }
}

export function mapGuardianUpdateRequest(form) {
  return projectUpdatePayload(
    compactPayload({
      full_name: form.fullName,
      relationship_type: form.relationshipType,
      contact_email: form.contactEmail,
      contact_phone: form.contactPhone,
    }),
    'guardians',
  )
}
