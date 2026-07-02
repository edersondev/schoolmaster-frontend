export function compactStudentSelfServiceParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  )
}

export function mapStudentPaginationQuery(query = {}) {
  return compactStudentSelfServiceParams({
    page: query.page,
    per_page: query.perPage,
    academic_period_id: query.academicPeriodId,
  })
}

export function mapStudentPaginatedEnvelope(envelope = {}, mapRecord = (record) => record) {
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

const LEARNING_SET_KEYS = new Set(['id', 'academic_period_id', 'title', 'status', 'published_at', 'entries'])
const ENTRY_KEYS = new Set(['entry_type', 'entry_reference_id', 'sequence', 'title', 'content_item'])
const CONTENT_KEYS = new Set(['id', 'title', 'content_type', 'file_size_bytes', 'scan_status', 'download_available'])
const GRADE_KEYS = new Set([
  'id',
  'school_id',
  'student_profile_id',
  'academic_period_id',
  'recorded_by_user_id',
  'grade_value',
  'grade_label',
  'status',
  'recorded_at',
])
const ATTENDANCE_KEYS = new Set([
  'id',
  'school_id',
  'student_profile_id',
  'academic_period_id',
  'recorded_by_user_id',
  'attendance_date',
  'attendance_status',
  'status',
])

export function safeDroppedFields(record = {}, allowedKeys = new Set()) {
  return Object.keys(record).filter((key) => !allowedKeys.has(key))
}

export function mapStudentContentMetadata(record = null) {
  if (!record) return null
  return {
    id: record.id ?? '',
    title: record.title ?? '',
    contentType: record.content_type ?? '',
    fileSizeBytes: Number(record.file_size_bytes) || 0,
    scanStatus: record.scan_status ?? 'unavailable',
    downloadAvailable: record.download_available === true,
    droppedFields: safeDroppedFields(record, CONTENT_KEYS),
  }
}

export function mapStudentLearningSetEntry(record = {}) {
  return {
    entryType: record.entry_type ?? '',
    entryReferenceId: record.entry_reference_id ?? '',
    sequence: Number(record.sequence) || 0,
    title: record.title ?? '',
    contentItem: mapStudentContentMetadata(record.content_item),
    readOnly: true,
    droppedFields: safeDroppedFields(record, ENTRY_KEYS),
  }
}

export function mapStudentLearningSet(record = {}) {
  return {
    id: record.id ?? '',
    academicPeriodId: record.academic_period_id ?? null,
    title: record.title ?? '',
    status: record.status ?? 'unavailable',
    publishedAt: record.published_at ?? null,
    entries: Array.isArray(record.entries) ? record.entries.map(mapStudentLearningSetEntry) : [],
    droppedFields: safeDroppedFields(record, LEARNING_SET_KEYS),
  }
}

export function mapStudentGradeRecord(record = {}) {
  return {
    id: record.id ?? '',
    schoolId: record.school_id ?? null,
    studentProfileId: record.student_profile_id ?? null,
    academicPeriodId: record.academic_period_id ?? null,
    recordedByUserId: record.recorded_by_user_id ?? null,
    gradeValue: Number(record.grade_value) || 0,
    gradeLabel: record.grade_label ?? null,
    status: record.status ?? 'unavailable',
    recordedAt: record.recorded_at ?? null,
    droppedFields: safeDroppedFields(record, GRADE_KEYS),
  }
}

export function mapStudentAttendanceRecord(record = {}) {
  return {
    id: record.id ?? '',
    schoolId: record.school_id ?? null,
    studentProfileId: record.student_profile_id ?? null,
    academicPeriodId: record.academic_period_id ?? null,
    recordedByUserId: record.recorded_by_user_id ?? null,
    attendanceDate: record.attendance_date ?? null,
    attendanceStatus: record.attendance_status ?? 'unavailable',
    status: record.status ?? 'unavailable',
    droppedFields: safeDroppedFields(record, ATTENDANCE_KEYS),
  }
}
