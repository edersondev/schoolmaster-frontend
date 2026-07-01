import { mapListEnvelope, mapPaginationQuery, teacherWorkflowHttp, unwrapData } from './teacherWorkflowHttp'
import { TEACHER_WORKFLOW_OPERATIONS } from './teacherWorkflowContract'
import { mapTeacherWorkflowStatusRequest } from './teacherContentService'

const ENDPOINT = '/api/v1/questionnaires'
export const QUESTION_TYPES = Object.freeze(['multiple_choice', 'true_false', 'short_text'])

export function mapQuestionnaire(record = {}) {
  return {
    id: record.id ?? record.questionnaire_id ?? '',
    schoolId: record.school_id ?? null,
    ownerUserId: record.owner_user_id ?? record.teacher_user_id ?? null,
    title: record.title ?? '',
    description: record.description ?? '',
    status: record.status ?? 'unavailable',
    questions: (record.questions ?? []).map(mapQuestion),
    createdAt: record.created_at ?? null,
    updatedAt: record.updated_at ?? null,
  }
}

export function mapQuestion(question = {}, index = 0) {
  return {
    id: question.id ?? `question-${index}`,
    type: question.type ?? question.question_type ?? '',
    prompt: question.prompt ?? question.text ?? '',
    options: question.options ?? [],
    answer: question.answer ?? question.correct_answer ?? null,
    sequence: question.sequence ?? index + 1,
  }
}

export function mapQuestionnaireRequest(form = {}) {
  return {
    title: form.title ?? '',
    description: form.description ?? null,
    questions: (form.questions ?? [])
      .filter((question) => QUESTION_TYPES.includes(question.type))
      .map((question, index) => ({
        type: question.type,
        prompt: question.prompt ?? '',
        options: question.type === 'short_text' ? undefined : question.options ?? [],
        answer: question.answer ?? null,
        sequence: question.sequence ?? index + 1,
      })),
  }
}

export function validateQuestionnaireDraft(form = {}) {
  const errors = {}
  if (!form.title) errors.title = ['Title is required.']
  if (!Array.isArray(form.questions) || form.questions.length === 0) {
    errors.questions = ['At least one question is required.']
  }
  form.questions?.forEach((question, index) => {
    if (!QUESTION_TYPES.includes(question.type)) errors[`questions.${index}.type`] = ['Unsupported question type.']
    if (!question.prompt) errors[`questions.${index}.prompt`] = ['Prompt is required.']
  })
  return errors
}

export function createQuestionnaireService(http = teacherWorkflowHttp) {
  return {
    list: (query = {}, options = {}) =>
      http.get(ENDPOINT, {
        params: mapPaginationQuery(query),
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.listQuestionnaires,
        map: (response) => mapListEnvelope(response, mapQuestionnaire),
      }),
    create: (form, options = {}) =>
      http.post(ENDPOINT, mapQuestionnaireRequest(form), {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.createQuestionnaire,
        map: (response) => mapQuestionnaire(unwrapData(response)),
      }),
    get: (id, options = {}) =>
      http.get(`${ENDPOINT}/${id}`, {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.getQuestionnaire,
        map: (response) => mapQuestionnaire(unwrapData(response)),
      }),
    update: (id, form, options = {}) =>
      http.patch(`${ENDPOINT}/${id}`, mapQuestionnaireRequest(form), {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.updateQuestionnaire,
        map: (response) => mapQuestionnaire(unwrapData(response)),
      }),
    updateStatus: (id, status, options = {}) =>
      http.patch(`${ENDPOINT}/${id}/status`, mapTeacherWorkflowStatusRequest(status), {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.updateQuestionnaireStatus,
        map: (response) => mapQuestionnaire(unwrapData(response)),
      }),
    delete: (id, options = {}) =>
      http.delete(`${ENDPOINT}/${id}`, {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.deleteQuestionnaire,
      }),
    restore: (id, options = {}) =>
      http.post(`${ENDPOINT}/${id}/restore`, {}, {
        options,
        operationId: TEACHER_WORKFLOW_OPERATIONS.restoreQuestionnaire,
        map: (response) => mapQuestionnaire(unwrapData(response)),
      }),
  }
}

export const questionnaireService = createQuestionnaireService()
