export function compactGuardianSelfServiceParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  )
}

export function mapGuardianPaginationQuery(query = {}) {
  return compactGuardianSelfServiceParams({
    page: query.page,
    per_page: query.perPage,
    academic_period_id: query.academicPeriodId,
  })
}

export function mapGuardianPaginatedEnvelope(envelope = {}, mapRecord = (record) => record) {
  const payload = envelope?.data && Array.isArray(envelope.data) ? envelope : envelope?.data ?? envelope
  return {
    items: Array.isArray(payload?.data) ? payload.data.map(mapRecord) : [],
    meta: {
      page: Number(payload?.meta?.page) || 1,
      perPage: Number(payload?.meta?.per_page) || 25,
      total: Number(payload?.meta?.total) || 0,
    },
  }
}

const STUDENT_SUMMARY_KEYS = new Set([
  'id',
  'school_id',
  'registration_number',
  'full_name',
  'status',
  'relationship_label',
  'enrolled_at',
  'current_academic_year_id',
])
const STUDENT_DETAIL_KEYS = new Set([
  'id',
  'first_name',
  'last_name',
  'full_name',
  'date_of_birth',
  'registration_number',
  'relationship_label',
  'status',
  'enrollment_summary',
])
const ENROLLMENT_KEYS = new Set([
  'grade_level',
  'section',
  'academic_year_id',
  'academic_year_label',
  'enrolled_at',
])
const ACADEMIC_SUMMARY_KEYS = new Set([
  'student',
  'academic_period_id',
  'grade_summary',
  'attendance_summary',
  'learning_sets',
])
const GRADE_SUMMARY_KEYS = new Set(['status', 'average', 'scale', 'last_updated_at'])
const ATTENDANCE_SUMMARY_KEYS = new Set([
  'status',
  'total_absences',
  'total_tardies',
  'attendance_rate',
  'last_updated_at',
])
const LEARNING_SET_SUMMARY_KEYS = new Set([
  'learning_set_id',
  'title',
  'status',
  'progress_percent',
  'last_activity_at',
])
const CONTACT_VIEW_KEYS = new Set([
  'student',
  'guardian_contact',
  'relationship_label',
  'student_primary_contact',
])
const GUARDIAN_CONTACT_KEYS = new Set(['name', 'email', 'phone', 'address', 'preferred_language'])
const STUDENT_PRIMARY_CONTACT_KEYS = new Set(['name', 'email', 'phone', 'address'])

export function safeDroppedGuardianFields(record = {}, allowedKeys = new Set()) {
  return Object.keys(record ?? {}).filter((key) => !allowedKeys.has(key))
}

export function mapGuardianStudentSummary(record = {}) {
  return {
    id: record.id ?? '',
    schoolId: record.school_id ?? null,
    registrationNumber: record.registration_number ?? null,
    fullName: record.full_name ?? '',
    status: record.status ?? 'unavailable',
    relationshipLabel: record.relationship_label ?? null,
    enrolledAt: record.enrolled_at ?? null,
    currentAcademicYearId: record.current_academic_year_id ?? null,
    droppedFields: safeDroppedGuardianFields(record, STUDENT_SUMMARY_KEYS),
  }
}

function mapEnrollmentSummary(record = {}) {
  return {
    gradeLevel: record?.grade_level ?? null,
    section: record?.section ?? null,
    academicYearId: record?.academic_year_id ?? null,
    academicYearLabel: record?.academic_year_label ?? null,
    enrolledAt: record?.enrolled_at ?? null,
    droppedFields: safeDroppedGuardianFields(record, ENROLLMENT_KEYS),
  }
}

export function mapGuardianStudentDetail(record = {}) {
  return {
    id: record.id ?? '',
    firstName: record.first_name ?? '',
    lastName: record.last_name ?? '',
    fullName: record.full_name ?? [record.first_name, record.last_name].filter(Boolean).join(' '),
    dateOfBirth: record.date_of_birth ?? null,
    registrationNumber: record.registration_number ?? null,
    relationshipLabel: record.relationship_label ?? null,
    status: record.status ?? 'unavailable',
    enrollmentSummary: mapEnrollmentSummary(record.enrollment_summary),
    droppedFields: safeDroppedGuardianFields(record, STUDENT_DETAIL_KEYS),
  }
}

export function mapGuardianGradeSummary(record = null) {
  if (!record) return null
  return {
    status: record.status ?? 'unavailable',
    average: record.average ?? null,
    scale: record.scale ?? null,
    lastUpdatedAt: record.last_updated_at ?? null,
    droppedFields: safeDroppedGuardianFields(record, GRADE_SUMMARY_KEYS),
  }
}

export function mapGuardianAttendanceSummary(record = null) {
  if (!record) return null
  return {
    status: record.status ?? 'unavailable',
    totalAbsences: record.total_absences ?? null,
    totalTardies: record.total_tardies ?? null,
    attendanceRate: record.attendance_rate ?? null,
    lastUpdatedAt: record.last_updated_at ?? null,
    droppedFields: safeDroppedGuardianFields(record, ATTENDANCE_SUMMARY_KEYS),
  }
}

export function mapGuardianLearningSetSummary(record = {}) {
  return {
    learningSetId: record.learning_set_id ?? '',
    title: record.title ?? '',
    status: record.status ?? 'unavailable',
    progressPercent: record.progress_percent ?? null,
    lastActivityAt: record.last_activity_at ?? null,
    droppedFields: safeDroppedGuardianFields(record, LEARNING_SET_SUMMARY_KEYS),
  }
}

export function mapGuardianAcademicSummary(record = {}) {
  return {
    student: mapGuardianStudentSummary(record.student),
    academicPeriodId: record.academic_period_id ?? null,
    gradeSummary: mapGuardianGradeSummary(record.grade_summary),
    attendanceSummary: mapGuardianAttendanceSummary(record.attendance_summary),
    learningSets: Array.isArray(record.learning_sets)
      ? record.learning_sets.map(mapGuardianLearningSetSummary)
      : [],
    droppedFields: safeDroppedGuardianFields(record, ACADEMIC_SUMMARY_KEYS),
  }
}

function mapContact(record = {}, allowedKeys = GUARDIAN_CONTACT_KEYS) {
  return {
    name: record?.name ?? null,
    email: record?.email ?? null,
    phone: record?.phone ?? null,
    address: record?.address ?? null,
    preferredLanguage: record?.preferred_language ?? null,
    droppedFields: safeDroppedGuardianFields(record, allowedKeys),
  }
}

export function mapGuardianContactView(record = {}) {
  return {
    student: mapGuardianStudentSummary(record.student),
    guardianContact: mapContact(record.guardian_contact, GUARDIAN_CONTACT_KEYS),
    relationshipLabel: record.relationship_label ?? record.student?.relationship_label ?? null,
    studentPrimaryContact: mapContact(record.student_primary_contact, STUDENT_PRIMARY_CONTACT_KEYS),
    droppedFields: safeDroppedGuardianFields(record, CONTACT_VIEW_KEYS),
  }
}
