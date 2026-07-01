import { mapListEnvelope, mapPaginationQuery, teacherWorkflowHttp, unwrapData } from './teacherWorkflowHttp'
import {
  assertContractGate,
  TEACHER_WORKFLOW_CONTRACT_GATES,
  TEACHER_WORKFLOW_OPERATIONS,
} from './teacherWorkflowContract'
import { mapTeacherWorkflowStatusRequest } from './teacherContentService'

const ENDPOINT = '/api/v1/learning-sets'

export function mapLearningSet(record = {}) {
  return {
    id: record.id ?? record.learning_set_id ?? '',
    schoolId: record.school_id ?? null,
    ownerUserId: record.owner_user_id ?? record.teacher_user_id ?? null,
    academicPeriodId: record.academic_period_id ?? null,
    title: record.title ?? '',
    description: record.description ?? '',
    status: record.status ?? 'unavailable',
    entries: record.entries ?? [],
    assignments: record.assignments ?? [],
    rosterAssignment: record.roster_assignment ?? null,
    dueAt: record.due_at ?? null,
    publishedAt: record.published_at ?? null,
    hasLegacyDirectAssignments: (record.assignments ?? []).some((entry) => entry.student_profile_id),
  }
}

export function mapLearningSetRequest(form = {}) {
  return {
    ...(form.academicPeriodId ? { academic_period_id: form.academicPeriodId } : {}),
    title: form.title ?? '',
    description: form.description ?? null,
    entries: form.entries ?? [],
    ...(form.rosterAssignment?.classSectionId
      ? { roster_assignment: { class_section_id: form.rosterAssignment.classSectionId } }
      : {}),
    due_at: form.dueAt ?? null,
  }
}

export function assertNoUndocumentedScopedFilters(query = {}) {
  const blockedKeys = ['academicPeriodId', 'classSectionId', 'rosterId', 'studentProfileId']
  const usedKey = blockedKeys.find((key) => query[key])
  if (usedKey) {
    assertContractGate('scopedLearningSetList', `Learning-set scoped filter is not documented: ${usedKey}`)
  }
}

export function createLearningSetService(http = teacherWorkflowHttp) {
  return {
    contractGates: TEACHER_WORKFLOW_CONTRACT_GATES,
    list: (query = {}, options = {}) => {
      assertNoUndocumentedScopedFilters(query)
      return http.get(ENDPOINT, {
        params: mapPaginationQuery(query),
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.listLearningSets,
        map: (response) => mapListEnvelope(response, mapLearningSet),
      })
    },
    create: (form, options = {}) => {
      assertContractGate('rosterAwareLearningSetCreate', 'Learning-set create requires roster-aware OpenAPI support.')
      return http.post(ENDPOINT, mapLearningSetRequest(form), {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.createLearningSet,
        map: (response) => mapLearningSet(unwrapData(response)),
      })
    },
    get: (id, options = {}) =>
      http.get(`${ENDPOINT}/${id}`, {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.getLearningSet,
        map: (response) => mapLearningSet(unwrapData(response)),
      }),
    update: (id, form, options = {}) =>
      http.patch(`${ENDPOINT}/${id}`, mapLearningSetRequest(form), {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.updateLearningSet,
        map: (response) => mapLearningSet(unwrapData(response)),
      }),
    updateStatus: (id, status, options = {}) =>
      http.patch(`${ENDPOINT}/${id}/status`, mapTeacherWorkflowStatusRequest(status), {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.updateLearningSetStatus,
        map: (response) => mapLearningSet(unwrapData(response)),
      }),
    delete: (id, options = {}) =>
      http.delete(`${ENDPOINT}/${id}`, {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.deleteLearningSet,
      }),
    restore: (id, options = {}) =>
      http.post(`${ENDPOINT}/${id}/restore`, {}, {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.restoreLearningSet,
        map: (response) => mapLearningSet(unwrapData(response)),
      }),
  }
}

export const learningSetService = createLearningSetService()
