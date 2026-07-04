export const ADVANCED_ASSESSMENT_OPERATIONS = Object.freeze({
  createQuestionnaire: 'createQuestionnaire',
  updateQuestionnaire: 'updateQuestionnaire',
  getQuestionnaire: 'getQuestionnaire',
  submitStudentQuestionnaireResponse: 'submitStudentQuestionnaireResponse',
  getStudentQuestionnaireResponse: 'getStudentQuestionnaireResponse',
  listQuestionnaireResponses: 'listQuestionnaireResponses',
  getQuestionnaireResponse: 'getQuestionnaireResponse',
  gradeQuestionnaireResponse: 'gradeQuestionnaireResponse',
  downloadQuestionnaireResponseFile: 'downloadQuestionnaireResponseFile',
})

export const ADVANCED_ASSESSMENT_ENDPOINTS = Object.freeze({
  questionnaires: '/api/v1/questionnaires',
  questionnaire: (questionnaireId) => `/api/v1/questionnaires/${questionnaireId}`,
  studentResponses: '/api/v1/student/questionnaire-responses',
  studentResponse: (responseAttemptId) => `/api/v1/student/questionnaire-responses/${responseAttemptId}`,
  responses: '/api/v1/questionnaire-responses',
  response: (responseAttemptId) => `/api/v1/questionnaire-responses/${responseAttemptId}`,
  grading: (responseAttemptId) => `/api/v1/questionnaire-responses/${responseAttemptId}/grading`,
  downloadFile: (responseAttemptId, fileId) =>
    `/api/v1/questionnaire-responses/${responseAttemptId}/files/${fileId}/download`,
})

export const ADVANCED_ASSESSMENT_PERMISSIONS = Object.freeze({
  author: 'assessments.questionnaires.manage',
  submit: 'assessments.responses.submit',
  review: 'assessments.responses.review',
  grade: 'assessments.responses.grade',
  downloadCleanFile: 'assessments.responses.files.download',
  report: 'reports.assessments.view',
})

export const ADVANCED_QUESTION_TYPES = Object.freeze([
  'multiple_choice',
  'true_false',
  'short_text',
  'long_text',
  'file_response',
])

export const ADVANCED_FILE_CATEGORIES = Object.freeze(['pdf', 'image', 'text', 'office'])
export const ADVANCED_MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024

export const ADVANCED_ASSESSMENT_FEEDBACK_STATES = Object.freeze({
  idle: 'idle',
  loading: 'loading',
  success: 'success',
  empty: 'empty',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  tenantMismatch: 'tenant-mismatch',
  validation: 'validation',
  notFound: 'not-found',
  conflict: 'conflict',
  afterDueDate: 'after-due-date',
  duplicateAttempt: 'duplicate-attempt',
  scanPending: 'scan-pending',
  scanFailed: 'scan-failed',
  unavailableFile: 'unavailable-file',
  contractUnavailable: 'contract-unavailable',
  temporaryUnavailable: 'temporary-unavailable',
  unsupportedAction: 'unsupported-action',
  staleResponse: 'stale-response',
})

export const ADVANCED_ASSESSMENT_ROUTE_NAMES = Object.freeze({
  workspace: 'advancedAssessmentWorkspace',
  authoring: 'advancedAssessmentAuthoring',
  studentResponse: 'advancedAssessmentStudentResponse',
  reviewQueue: 'advancedAssessmentReviewQueue',
  grading: 'advancedAssessmentGrading',
  studentResult: 'advancedAssessmentStudentResult',
  reporting: 'advancedAssessmentReporting',
})

export function compactAssessmentParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  )
}

export function mapAssessmentPaginationQuery(query = {}) {
  return compactAssessmentParams({
    page: query.page,
    per_page: query.perPage,
  })
}

export function unwrapAssessmentData(response) {
  const envelope = response?.data ?? response
  return envelope?.data ?? envelope
}

export function mapAssessmentPaginatedEnvelope(response = {}, mapRecord = (record) => record) {
  const envelope = response?.data ?? response
  const items = envelope?.data ?? envelope?.items ?? []
  const meta = envelope?.meta ?? envelope?.pagination ?? {}
  return {
    items: items.map(mapRecord),
    pagination: {
      page: meta.current_page ?? meta.page ?? 1,
      perPage: meta.per_page ?? meta.perPage ?? items.length,
      total: meta.total ?? items.length,
    },
  }
}

export function createAdvancedAssessmentFeedbackState(type, options = {}) {
  return {
    type,
    code: options.code ?? null,
    message: options.message ?? '',
    fields: options.fields ?? {},
    safeDetails: options.safeDetails ?? {},
    diagnostic: options.diagnostic ?? null,
  }
}

export function mapQuestionnaire(record = {}) {
  return {
    id: record.id ?? record.questionnaire_id ?? '',
    schoolId: record.school_id ?? null,
    title: record.title ?? '',
    description: record.description ?? '',
    status: record.status ?? 'unavailable',
    lifecycleLockState: record.lifecycle_lock_state ?? record.lifecycleLockState ?? 'editable',
    questions: (record.questions ?? []).map(mapQuestion),
    createdAt: record.created_at ?? null,
    updatedAt: record.updated_at ?? null,
  }
}

export function mapQuestion(question = {}, index = 0) {
  const type = question.type ?? question.question_type ?? ''
  return {
    id: question.id ?? question.question_id ?? `question-${index + 1}`,
    type,
    prompt: question.prompt ?? question.text ?? '',
    sequence: question.sequence ?? index + 1,
    options: Array.isArray(question.options) ? question.options : [],
    answerSchema: mapAnswerSchema(question.answer_schema ?? question.answerSchema ?? {}, type),
    gradingRule: mapGradingRule(question.grading_rule ?? question.gradingRule ?? {}),
    fileRule: mapFileRule(question.file_rule ?? question.fileRule ?? {}),
    visibilityState: question.visibility_state ?? question.visibilityState ?? 'visible',
    lifecycleLockState: question.lifecycle_lock_state ?? question.lifecycleLockState ?? 'editable',
  }
}

export function mapAnswerSchema(schema = {}, type = '') {
  if (type === 'long_text') {
    return {
      minLength: schema.min_length ?? schema.minLength ?? 1,
      maxLength: schema.max_length ?? schema.maxLength ?? 10000,
      plainTextOnly: schema.plain_text_only ?? schema.plainTextOnly ?? true,
    }
  }
  return { ...schema }
}

export function mapFileRule(rule = {}) {
  return {
    allowedCategories: rule.allowed_categories ?? rule.allowedCategories ?? ADVANCED_FILE_CATEGORIES,
    maxFileSize: rule.max_file_size ?? rule.maxFileSize ?? ADVANCED_MAX_FILE_SIZE_BYTES,
    maxFiles: rule.max_files ?? rule.maxFiles ?? 1,
    gradingExpectation: rule.grading_expectation ?? rule.gradingExpectation ?? 'manual',
  }
}

export function mapGradingRule(rule = {}) {
  return {
    mode: rule.mode ?? 'manual',
    maxScore: rule.max_score ?? rule.maxScore ?? 100,
    studentFeedbackAllowed: rule.student_feedback_allowed ?? rule.studentFeedbackAllowed ?? true,
  }
}

export function mapQuestionnairePayload(form = {}) {
  return {
    title: form.title ?? '',
    description: form.description ?? null,
    questions: (form.questions ?? [])
      .filter((question) => ADVANCED_QUESTION_TYPES.includes(question.type))
      .map((question, index) => compactAssessmentParams({
        type: question.type,
        prompt: question.prompt ?? '',
        sequence: question.sequence ?? index + 1,
        options: ['multiple_choice', 'true_false'].includes(question.type) ? question.options ?? [] : undefined,
        answer_schema: question.type === 'long_text' ? mapAnswerSchema(question.answerSchema, 'long_text') : undefined,
        file_rule: question.type === 'file_response' ? mapFileRule(question.fileRule) : undefined,
        grading_rule: mapGradingRule(question.gradingRule),
      })),
  }
}

export function validateQuestionnaireDraft(form = {}) {
  const fields = {}
  if (!form.title) fields.title = ['Title is required.']
  if (!Array.isArray(form.questions) || form.questions.length === 0) {
    fields.questions = ['At least one question is required.']
  }
  form.questions?.forEach((question, index) => {
    if (!ADVANCED_QUESTION_TYPES.includes(question.type)) fields[`questions.${index}.type`] = ['Unsupported question type.']
    if (!question.prompt?.trim()) fields[`questions.${index}.prompt`] = ['Prompt is required.']
  })
  return fields
}

export function mapResponseAttempt(record = {}) {
  return {
    id: record.id ?? record.response_attempt_id ?? '',
    questionnaireId: record.questionnaire_id ?? null,
    learningSetId: record.learning_set_id ?? null,
    studentId: record.student_id ?? null,
    studentDisplayName: record.student_display_name ?? record.student_name ?? '',
    submittedAt: record.submitted_at ?? null,
    dueDate: record.due_date ?? null,
    submissionStatus: record.submission_status ?? record.status ?? 'unavailable',
    gradingStatus: record.grading_status ?? 'ungraded',
    scoreSummary: record.score_summary ?? null,
    teacherFeedbackSummary: record.teacher_feedback_summary ?? record.feedback_summary ?? '',
    answers: (record.answers ?? []).map(mapAnswer),
    files: (record.files ?? record.answer_files ?? []).map(mapResponseFile),
  }
}

export function mapAnswer(answer = {}, index = 0) {
  return {
    id: answer.id ?? answer.answer_id ?? `answer-${index + 1}`,
    questionId: answer.question_id ?? null,
    questionType: answer.question_type ?? answer.type ?? '',
    prompt: answer.prompt ?? '',
    text: answer.text_answer ?? answer.text ?? '',
    file: answer.file ? mapResponseFile(answer.file) : null,
    gradingState: answer.grading_state ?? 'ungraded',
    score: answer.score ?? null,
    scanStatus: answer.scan_status ?? answer.scanStatus ?? 'not-applicable',
  }
}

export function mapResponseFile(file = {}) {
  const scanStatus = file.scan_status ?? file.scanStatus ?? 'unavailable'
  return {
    id: file.id ?? file.file_id ?? '',
    displayName: file.display_name ?? file.name ?? '',
    category: file.category ?? 'unknown',
    size: file.size ?? file.size_bytes ?? 0,
    scanStatus,
    availabilityState: file.availability_state ?? file.availabilityState ?? scanStatus,
    downloadAllowed: Boolean(file.download_allowed ?? file.downloadAllowed ?? scanStatus === 'clean'),
  }
}

export function mapReviewFilters(filters = {}) {
  return compactAssessmentParams({
    questionnaire_id: filters.questionnaireId,
    learning_set_id: filters.learningSetId,
    grading_status: filters.gradingStatus,
  })
}

export function mapStudentResult(record = {}) {
  const response = mapResponseAttempt(record)
  return {
    responseAttemptId: response.id,
    questionnaireId: response.questionnaireId,
    submissionStatus: response.submissionStatus,
    gradingStatus: response.gradingStatus,
    scoreSummary: response.scoreSummary,
    teacherFeedbackSummary: response.teacherFeedbackSummary,
    fileAvailabilityMetadata: response.files.map(({ id, displayName, category, size, scanStatus, availabilityState }) => ({
      id,
      displayName,
      category,
      size,
      scanStatus,
      availabilityState,
    })),
  }
}

export function mapReportAggregate(record = {}) {
  return {
    counts: record.counts ?? record.assessment_counts ?? {},
    completionStatus: record.completion_status ?? record.completionStatus ?? null,
    gradingStatus: record.grading_status ?? record.gradingStatus ?? null,
    scoreSummary: record.score_summary ?? record.scoreSummary ?? null,
  }
}
