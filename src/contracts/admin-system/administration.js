export const ADMIN_FEEDBACK_STATES = Object.freeze({
  idle: 'idle',
  loading: 'loading',
  ready: 'ready',
  empty: 'empty',
  filteredEmpty: 'filtered-empty',
  validation: 'validation',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  tenantMismatch: 'tenant-mismatch',
  inactiveContext: 'inactive-context',
  notFound: 'not-found',
  unavailable: 'unavailable',
  unknown: 'unknown',
})

export const ADMIN_RECOVERY_ACTIONS = Object.freeze({
  retry: 'retry',
  chooseSchool: 'choose-school',
  signIn: 'sign-in',
  resetFilters: 'reset-filters',
  return: 'return',
  none: 'none',
})

export function mapPaginatedEnvelope(envelope = {}) {
  return {
    items: Array.isArray(envelope.data) ? envelope.data : [],
    meta: {
      page: Number(envelope.meta?.page) || 1,
      perPage: Number(envelope.meta?.per_page) || 25,
      total: Number(envelope.meta?.total) || 0,
    },
  }
}

export function createAdminListState() {
  return {
    items: [],
    meta: { page: 1, perPage: 25, total: 0 },
    status: ADMIN_FEEDBACK_STATES.idle,
    error: null,
    requestKey: null,
  }
}

export function createAdminFormState(initialValues = {}) {
  return {
    initialValues: structuredClone(initialValues),
    values: structuredClone(initialValues),
    fieldErrors: {},
    formError: null,
    status: ADMIN_FEEDBACK_STATES.idle,
    submitted: false,
  }
}

export function compactPayload(payload = {}) {
  return Object.fromEntries(
    Object.entries(payload).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined,
    ),
  )
}

export function mapCommonRecord(record = {}) {
  return {
    ...record,
    schoolId: record.school_id ?? null,
    fullName: record.full_name ?? record.name ?? '',
    contactEmail: record.contact_email ?? null,
    contactPhone: record.contact_phone ?? null,
    addressSummary: record.address_summary ?? null,
    startDate: record.start_date ?? null,
    endDate: record.end_date ?? null,
    academicYearId: record.academic_year_id ?? null,
    relationshipType: record.relationship_type ?? null,
    registrationNumber: record.registration_number ?? null,
    enrolledAt: record.enrolled_at ?? null,
  }
}
