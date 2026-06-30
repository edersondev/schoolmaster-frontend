import { ADMIN_FEEDBACK_STATES, compactPayload, isPresent, mapCommonRecord } from './administration'

export const CLASS_SECTION_STATUS = Object.freeze({
  active: 'active',
  inactive: 'inactive',
})

export const ROSTER_MEMBERSHIP_STATUS = Object.freeze({
  active: 'active',
  ended: 'ended',
})

export const ROSTER_BATCH_LIMIT = 100

export const CLASSROOM_ROSTER_FEEDBACK = Object.freeze({
  ...ADMIN_FEEDBACK_STATES,
  noCurrentPeriod: 'no-current-period',
  oversizedBatch: 'oversized-batch',
  unsupportedFilter: 'unsupported-filter',
  unsupportedSort: 'unsupported-sort',
  unsupportedPageSize: 'unsupported-page-size',
  temporaryUnavailable: 'temporary-unavailable',
})

export function createAcademicPeriodScope(overrides = {}) {
  return { academicPeriodId: '', label: '', status: '', isCurrent: false, routeQuery: {}, ...overrides }
}

export function createClassSectionDraft(overrides = {}) {
  return { academicPeriodId: '', code: '', name: '', course: '', classroom: '', section: '', group: '', ...overrides }
}

export function createRosterMembershipBatchDraft(overrides = {}) {
  return {
    academicPeriodId: '',
    effectiveStartDate: '',
    effectiveEndDate: '',
    reason: '',
    studentProfileIds: [],
    rosterMembershipIds: [],
    ...overrides,
  }
}

export function validateClassSectionDraft(form = {}) {
  const errors = {}
  if (!isPresent(form.academicPeriodId)) errors.academic_period_id = ['Academic period is required.']
  if (!isPresent(form.code)) errors.code = ['Code is required.']
  if (!isPresent(form.name)) errors.name = ['Name is required.']
  return errors
}

export function validateRosterBatchAddDraft(form = {}) {
  const errors = {}
  if (!isPresent(form.academicPeriodId)) errors.academic_period_id = ['Academic period is required.']
  if (!isPresent(form.effectiveStartDate)) errors.effective_start_date = ['Start date is required.']
  const ids = uniqueIds(form.studentProfileIds)
  if (ids.length < 1) errors.student_profile_ids = ['Select at least one student.']
  if (ids.length > ROSTER_BATCH_LIMIT) errors.student_profile_ids = ['Select no more than 100 students.']
  return errors
}

export function validateRosterBatchEndDraft(form = {}) {
  const errors = {}
  if (!isPresent(form.effectiveEndDate)) errors.effective_end_date = ['End date is required.']
  if (!isPresent(form.reason)) errors.reason = ['Reason is required.']
  const ids = uniqueIds(form.rosterMembershipIds)
  if (ids.length < 1) errors.roster_membership_ids = ['Select at least one membership.']
  if (ids.length > ROSTER_BATCH_LIMIT) errors.roster_membership_ids = ['Select no more than 100 memberships.']
  return errors
}

export function mapAcademicPeriodScope(record = {}) {
  return createAcademicPeriodScope({
    academicPeriodId: record.id ?? record.academic_period_id ?? '',
    label: record.name ?? record.label ?? '',
    status: record.status ?? '',
    isCurrent: Boolean(record.is_current ?? record.current ?? false),
  })
}

export function mapClassSection(record = {}) {
  return {
    ...mapCommonRecord(record),
    id: record.id ?? null,
    academicPeriodId: record.academic_period_id ?? null,
    code: record.code ?? '',
    name: record.name ?? '',
    course: record.course ?? record.metadata?.course?.name ?? '',
    classroom: record.classroom ?? record.metadata?.classroom?.name ?? '',
    section: record.section ?? record.metadata?.section?.name ?? '',
    group: record.group ?? record.metadata?.group?.name ?? '',
    status: record.status ?? CLASS_SECTION_STATUS.active,
    inactiveReason: record.inactive_reason ?? null,
    inactiveEffectiveAt: record.inactive_effective_at ?? null,
  }
}

export function mapClassSectionCreateRequest(form = {}) {
  return compactPayload({
    academic_period_id: form.academicPeriodId,
    code: form.code,
    name: form.name,
    course: form.course,
    classroom: form.classroom,
    section: form.section,
    group: form.group,
  })
}

export function mapClassSectionUpdateRequest(form = {}) {
  return compactPayload({
    code: form.code,
    name: form.name,
    course: form.course,
    classroom: form.classroom,
    section: form.section,
    group: form.group,
  })
}

export function mapClassSectionStatusRequest(form = {}) {
  return compactPayload({ status: form.status, effective_at: form.effectiveAt, reason: form.reason })
}

export function mapRosterMembership(record = {}) {
  return {
    id: record.id ?? null,
    schoolId: record.school_id ?? null,
    classSectionId: record.class_section_id ?? null,
    studentProfileId: record.student_profile_id ?? null,
    academicPeriodId: record.academic_period_id ?? null,
    status: record.status ?? ROSTER_MEMBERSHIP_STATUS.active,
    effectiveStartDate: record.effective_start_date ?? null,
    effectiveEndDate: record.effective_end_date ?? null,
    endReason: record.end_reason ?? null,
    createdByUserId: record.created_by_user_id ?? null,
    endedByUserId: record.ended_by_user_id ?? null,
  }
}

export function mapRosterBatchAddRequest(form = {}) {
  return compactPayload({
    academic_period_id: form.academicPeriodId,
    effective_start_date: form.effectiveStartDate,
    student_profile_ids: uniqueIds(form.studentProfileIds),
  })
}

export function mapRosterBatchEndRequest(form = {}) {
  return compactPayload({
    effective_end_date: form.effectiveEndDate,
    reason: form.reason,
    roster_membership_ids: uniqueIds(form.rosterMembershipIds),
  })
}

export function mapRosterBatchResult(record = {}) {
  return {
    succeeded: Boolean(record.succeeded ?? record.success ?? true),
    memberships: Array.isArray(record.memberships) ? record.memberships.map(mapRosterMembership) : [],
    rejected: Array.isArray(record.rejected) ? record.rejected : [],
  }
}

export function uniqueIds(ids = []) {
  return [...new Set((Array.isArray(ids) ? ids : []).filter(Boolean))]
}
