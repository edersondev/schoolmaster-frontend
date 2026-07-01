import { mapListEnvelope, mapPaginationQuery, teacherWorkflowHttp, unwrapData } from './teacherWorkflowHttp'
import { assertContractGate, TEACHER_WORKFLOW_OPERATIONS } from './teacherWorkflowContract'
import { mapTeacherWorkflowStatusRequest } from './teacherContentService'

const ENDPOINT = '/api/v1/grades'

export function mapCorrectionHistory(items = []) {
  return items.map((item) => ({
    id: item.id ?? '',
    actorUserId: item.actor_user_id ?? null,
    originalValue: item.original_value ?? null,
    newValue: item.new_value ?? null,
    reasonSummary: item.reason_summary ?? item.reason ?? '',
    correctedAt: item.corrected_at ?? item.created_at ?? null,
    visibility: item.visibility ?? 'summary',
  }))
}

export function mapGrade(record = {}) {
  return {
    id: record.id ?? record.grade_id ?? '',
    schoolId: record.school_id ?? null,
    studentProfileId: record.student_profile_id ?? null,
    academicPeriodId: record.academic_period_id ?? null,
    recordedByUserId: record.recorded_by_user_id ?? null,
    gradeValue: record.grade_value ?? record.current_value ?? null,
    currentValue: record.current_value ?? record.grade_value ?? null,
    originalValue: record.original_value ?? null,
    gradeLabel: record.grade_label ?? '',
    correctionHistory: mapCorrectionHistory(record.correction_history ?? []),
    status: record.status ?? 'unavailable',
    recordedAt: record.recorded_at ?? record.created_at ?? null,
  }
}

export function mapGradeCreateRequest(form = {}) {
  return {
    student_profile_id: form.studentProfileId,
    academic_period_id: form.academicPeriodId,
    grade_value: Number(form.gradeValue),
    ...(form.gradeLabel ? { grade_label: form.gradeLabel } : {}),
  }
}

export function mapGradeCorrectionRequest(form = {}) {
  return {
    grade_value: Number(form.gradeValue),
    ...(form.gradeLabel ? { grade_label: form.gradeLabel } : {}),
    correction_reason: form.correctionReason ?? '',
  }
}

export function assertGradeScopedListSupported(query = {}) {
  if (query.academicPeriodId || query.classSectionId || query.rosterId) {
    assertContractGate('scopedGradeList', 'Grade scoped filters are not documented.')
  }
}

export function createGradeService(http = teacherWorkflowHttp) {
  return {
    list: (query = {}, options = {}) => {
      assertGradeScopedListSupported(query)
      return http.get(ENDPOINT, {
        params: mapPaginationQuery(query),
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.listGrades,
        map: (response) => mapListEnvelope(response, mapGrade),
      })
    },
    create: (form, options = {}) =>
      http.post(ENDPOINT, mapGradeCreateRequest(form), {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.createGrade,
        map: (response) => mapGrade(unwrapData(response)),
      }),
    get: (id, options = {}) =>
      http.get(`${ENDPOINT}/${id}`, {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.getGrade,
        map: (response) => mapGrade(unwrapData(response)),
      }),
    correct: (id, form, options = {}) =>
      http.patch(`${ENDPOINT}/${id}/correction`, mapGradeCorrectionRequest(form), {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.correctGrade,
        map: (response) => mapGrade(unwrapData(response)),
      }),
    updateStatus: (id, status, options = {}) =>
      http.patch(`${ENDPOINT}/${id}/status`, mapTeacherWorkflowStatusRequest(status), {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.updateGradeStatus,
        map: (response) => mapGrade(unwrapData(response)),
      }),
    delete: (id, options = {}) =>
      http.delete(`${ENDPOINT}/${id}`, {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.deleteGrade,
      }),
    restore: (id, options = {}) =>
      http.post(`${ENDPOINT}/${id}/restore`, {}, {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.restoreGrade,
        map: (response) => mapGrade(unwrapData(response)),
      }),
  }
}

export const gradeService = createGradeService()
