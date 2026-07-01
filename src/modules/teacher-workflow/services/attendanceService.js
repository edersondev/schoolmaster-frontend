import { mapListEnvelope, mapPaginationQuery, teacherWorkflowHttp, unwrapData } from './teacherWorkflowHttp'
import { assertContractGate, TEACHER_WORKFLOW_OPERATIONS } from './teacherWorkflowContract'
import { mapTeacherWorkflowStatusRequest } from './teacherContentService'
import { mapCorrectionHistory } from './gradeService'

const ENDPOINT = '/api/v1/attendance'
export const ATTENDANCE_STATUSES = Object.freeze(['present', 'absent', 'late', 'excused', 'remote', 'suspended'])

export function mapAttendance(record = {}) {
  return {
    id: record.id ?? record.attendance_id ?? '',
    schoolId: record.school_id ?? null,
    studentProfileId: record.student_profile_id ?? null,
    academicPeriodId: record.academic_period_id ?? null,
    recordedByUserId: record.recorded_by_user_id ?? null,
    attendanceDate: record.attendance_date ?? null,
    attendanceStatus: record.attendance_status ?? record.current_value ?? '',
    currentValue: record.current_value ?? record.attendance_status ?? '',
    originalValue: record.original_value ?? null,
    correctionHistory: mapCorrectionHistory(record.correction_history ?? []),
    status: record.status ?? 'unavailable',
  }
}

export function mapAttendanceCreateRequest(form = {}) {
  return {
    student_profile_id: form.studentProfileId,
    academic_period_id: form.academicPeriodId,
    attendance_date: form.attendanceDate,
    attendance_status: form.attendanceStatus,
  }
}

export function mapAttendanceCorrectionRequest(form = {}) {
  return {
    attendance_status: form.attendanceStatus,
    correction_reason: form.correctionReason ?? '',
  }
}

export function assertAttendanceScopedListSupported(query = {}) {
  if (query.academicPeriodId || query.classSectionId || query.rosterId) {
    assertContractGate('scopedAttendanceList', 'Attendance scoped filters are not documented.')
  }
}

export function createAttendanceService(http = teacherWorkflowHttp) {
  return {
    list: (query = {}, options = {}) => {
      assertAttendanceScopedListSupported(query)
      return http.get(ENDPOINT, {
        params: mapPaginationQuery(query),
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.listAttendance,
        map: (response) => mapListEnvelope(response, mapAttendance),
      })
    },
    create: (form, options = {}) =>
      http.post(ENDPOINT, mapAttendanceCreateRequest(form), {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.createAttendance,
        map: (response) => mapAttendance(unwrapData(response)),
      }),
    get: (id, options = {}) =>
      http.get(`${ENDPOINT}/${id}`, {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.getAttendance,
        map: (response) => mapAttendance(unwrapData(response)),
      }),
    correct: (id, form, options = {}) =>
      http.patch(`${ENDPOINT}/${id}/correction`, mapAttendanceCorrectionRequest(form), {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.correctAttendance,
        map: (response) => mapAttendance(unwrapData(response)),
      }),
    updateStatus: (id, status, options = {}) =>
      http.patch(`${ENDPOINT}/${id}/status`, mapTeacherWorkflowStatusRequest(status), {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.updateAttendanceStatus,
        map: (response) => mapAttendance(unwrapData(response)),
      }),
    delete: (id, options = {}) =>
      http.delete(`${ENDPOINT}/${id}`, {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.deleteAttendance,
      }),
    restore: (id, options = {}) =>
      http.post(`${ENDPOINT}/${id}/restore`, {}, {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.restoreAttendance,
        map: (response) => mapAttendance(unwrapData(response)),
      }),
  }
}

export const attendanceService = createAttendanceService()
