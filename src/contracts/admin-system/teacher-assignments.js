import { ADMIN_FEEDBACK_STATES, compactPayload, isPresent } from './administration'

export const TEACHER_ASSIGNMENT_STATUS = Object.freeze({
  active: 'active',
  inactive: 'inactive',
})

export const TEACHER_ASSIGNMENT_SCOPE = Object.freeze({
  adminOnly: 'admin-only',
  teacherRouteDeferred: 'teacher-route-deferred',
  sectionScopedListBlocked: 'section-scoped-list-blocked',
})

export const TEACHER_ASSIGNMENT_FEEDBACK = Object.freeze({
  ...ADMIN_FEEDBACK_STATES,
  unsupportedFilter: 'unsupported-filter',
  unsupportedSort: 'unsupported-sort',
  unsupportedPageSize: 'unsupported-page-size',
  temporaryUnavailable: 'temporary-unavailable',
})

export function createTeacherAssignmentDraft(overrides = {}) {
  return {
    classSectionId: '',
    teacherUserId: '',
    academicPeriodId: '',
    effectiveStartDate: '',
    effectiveEndDate: '',
    deactivationReason: '',
    ...overrides,
  }
}

export function createTeacherAssignmentDeactivateDraft(overrides = {}) {
  return { status: TEACHER_ASSIGNMENT_STATUS.inactive, effectiveEndDate: '', reason: '', ...overrides }
}

export function validateTeacherAssignmentDraft(form = {}) {
  const errors = {}
  if (!isPresent(form.classSectionId)) errors.class_section_id = ['Class section is required.']
  if (!isPresent(form.teacherUserId)) errors.teacher_user_id = ['Teacher is required.']
  if (!isPresent(form.academicPeriodId)) errors.academic_period_id = ['Academic period is required.']
  if (!isPresent(form.effectiveStartDate)) errors.effective_start_date = ['Start date is required.']
  return errors
}

export function validateTeacherAssignmentDeactivateDraft(form = {}) {
  const errors = {}
  if (!isPresent(form.effectiveEndDate)) errors.effective_end_date = ['End date is required.']
  if (!isPresent(form.reason)) errors.reason = ['Reason is required.']
  return errors
}

export function mapTeacherAssignment(record = {}) {
  return {
    id: record.id ?? null,
    schoolId: record.school_id ?? null,
    classSectionId: record.class_section_id ?? null,
    teacherUserId: record.teacher_user_id ?? null,
    academicPeriodId: record.academic_period_id ?? null,
    status: record.status ?? TEACHER_ASSIGNMENT_STATUS.active,
    effectiveStartDate: record.effective_start_date ?? null,
    effectiveEndDate: record.effective_end_date ?? null,
    deactivationReason: record.deactivation_reason ?? record.reason ?? null,
    teacherName: record.teacher?.full_name ?? record.teacher_name ?? '',
    classSectionName: record.class_section?.name ?? record.class_section_name ?? '',
  }
}

export function mapTeacherAssignmentCreateRequest(form = {}) {
  return compactPayload({
    class_section_id: form.classSectionId,
    teacher_user_id: form.teacherUserId,
    academic_period_id: form.academicPeriodId,
    effective_start_date: form.effectiveStartDate,
  })
}

export function mapTeacherAssignmentStatusRequest(form = {}) {
  return compactPayload({
    status: form.status ?? TEACHER_ASSIGNMENT_STATUS.inactive,
    effective_end_date: form.effectiveEndDate,
    reason: form.reason ?? form.deactivationReason,
  })
}
