import {
  ADMIN_FEEDBACK_STATES,
  compactPayload,
  isPresent,
  mapCommonRecord,
} from './administration'

export const STUDENT_PROFILE_STATUS = Object.freeze({
  active: 'active',
  inactive: 'inactive',
  transferred: 'transferred',
  deleted: 'deleted',
  unavailable: 'unavailable',
  historicalOnly: 'historical-only',
})

export const STUDENT_PROFILE_BLOCKED_ACTIONS = Object.freeze({
  generalEdit: 'student-profile-general-edit-blocked',
  teacherOwnAssignmentRoute: 'teacher-own-assignment-deferred',
})

export const STUDENT_PROFILE_FEEDBACK = Object.freeze({
  ...ADMIN_FEEDBACK_STATES,
  inactiveSchool: 'inactive-school',
  inactiveRecord: 'inactive-record',
  unsupportedFilter: 'unsupported-filter',
  unsupportedSort: 'unsupported-sort',
  unsupportedPageSize: 'unsupported-page-size',
  temporaryUnavailable: 'temporary-unavailable',
})

export function createStudentProfileDraft(overrides = {}) {
  return {
    userId: '',
    registrationNumber: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    contactEmail: '',
    contactPhone: '',
    currentAcademicYearId: '',
    status: STUDENT_PROFILE_STATUS.active,
    enrolledAt: '',
    guardianAssociations: [],
    ...overrides,
  }
}

export function createStudentStatusDraft(overrides = {}) {
  return { status: '', effectiveAt: '', reason: '', ...overrides }
}

export function createStudentTransferDraft(overrides = {}) {
  return {
    effectiveAt: '',
    reason: '',
    destinationSchoolId: '',
    destinationStudentProfileId: '',
    ...overrides,
  }
}

export function validateStudentProfileDraft(form = {}) {
  const errors = {}
  if (!isPresent(form.registrationNumber)) errors.registration_number = ['Registration number is required.']
  if (!isPresent(form.firstName)) errors.first_name = ['First name is required.']
  if (!isPresent(form.lastName)) errors.last_name = ['Last name is required.']
  if (!isPresent(form.enrolledAt)) errors.enrolled_at = ['Enrollment date is required.']
  return errors
}

export function validateStudentLifecycleDraft(form = {}) {
  const errors = {}
  if (!isPresent(form.effectiveAt)) errors.effective_at = ['Effective date is required.']
  if (!isPresent(form.reason)) errors.reason = ['Reason is required.']
  return errors
}

export function mapStudentProfile(record = {}) {
  const mapped = mapCommonRecord(record)
  return {
    ...mapped,
    id: record.id ?? null,
    userId: record.user_id ?? mapped.userId ?? null,
    firstName: record.first_name ?? mapped.firstName ?? '',
    lastName: record.last_name ?? mapped.lastName ?? '',
    fullName: record.full_name ?? [record.first_name, record.last_name].filter(Boolean).join(' '),
    dateOfBirth: record.date_of_birth ?? null,
    currentAcademicYearId: record.current_academic_year_id ?? null,
    status: record.status ?? STUDENT_PROFILE_STATUS.unavailable,
    statusEffectiveAt: record.status_effective_at ?? record.effective_at ?? null,
    enrollmentHistory: Array.isArray(record.enrollment_history)
      ? record.enrollment_history.map(mapEnrollmentHistory)
      : [],
    guardianAssociations: Array.isArray(record.guardian_associations)
      ? record.guardian_associations.map(mapGuardianAssociation)
      : [],
    activeEligible: Boolean(record.active_eligible ?? record.status === STUDENT_PROFILE_STATUS.active),
  }
}

export function mapStudentProfileCreateRequest(form = {}) {
  return compactPayload({
    user_id: form.userId,
    registration_number: form.registrationNumber,
    first_name: form.firstName,
    last_name: form.lastName,
    date_of_birth: form.dateOfBirth,
    contact_email: form.contactEmail,
    contact_phone: form.contactPhone,
    current_academic_year_id: form.currentAcademicYearId,
    status: form.status,
    enrolled_at: form.enrolledAt,
    guardian_associations: form.guardianAssociations,
  })
}

export function mapStudentStatusRequest(form = {}) {
  return compactPayload({
    status: form.status,
    effective_at: form.effectiveAt,
    reason: form.reason,
  })
}

export function mapStudentTransferRequest(form = {}) {
  return compactPayload({
    effective_at: form.effectiveAt,
    reason: form.reason,
    destination_school_id: form.destinationSchoolId,
    destination_student_profile_id: form.destinationStudentProfileId,
  })
}

export function mapStudentLifecycleResult(record = {}) {
  return {
    studentProfile: mapStudentProfile(record.student_profile ?? record.data ?? record),
    effectiveAt: record.effective_at ?? null,
    status: record.status ?? null,
  }
}

function mapEnrollmentHistory(record = {}) {
  return {
    status: record.status ?? '',
    effectiveAt: record.effective_at ?? null,
    reason: record.reason ?? null,
  }
}

function mapGuardianAssociation(record = {}) {
  return {
    guardianId: record.guardian_id ?? record.guardianId ?? null,
    relationshipType: record.relationship_type ?? record.relationshipType ?? null,
    status: record.status ?? null,
  }
}
