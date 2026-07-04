import { computed, reactive } from 'vue'
import { validateFileSelection, validateLongTextAnswer } from '@/contracts/assessments/studentResponsePayloadMapper'
import { studentResponseSubmissionService } from '@/services/assessments/studentResponseSubmissionService'

export function useStudentAdvancedResponse({ service = studentResponseSubmissionService, questionnaire = {}, options = {} } = {}) {
  const state = reactive({
    pending: false,
    feedback: null,
    submitted: null,
    textAnswers: {},
    fileAnswers: {},
  })

  const questions = computed(() => questionnaire.questions ?? [])
  const dueDatePassed = computed(() => questionnaire.dueDate ? Date.now() > new Date(questionnaire.dueDate).getTime() : false)
  const canSubmit = computed(() => !state.pending && !state.submitted && !dueDatePassed.value)

  function setTextAnswer(questionId, value) {
    state.textAnswers[questionId] = value
  }

  function setFileAnswer(questionId, files, rule = {}) {
    const validation = validateFileSelection(files, rule)
    state.fileAnswers[questionId] = validation.valid ? validation.file : null
    if (!validation.valid) state.feedback = { type: 'validation', gate: validation.reason }
  }

  function validationErrors() {
    const fields = {}
    questions.value.forEach((question) => {
      if (question.type === 'long_text') {
        const validation = validateLongTextAnswer(state.textAnswers[question.id] ?? '', question.answerSchema)
        if (!validation.valid) fields[question.id] = [validation.reason]
      }
      if (question.type === 'file_response' && !state.fileAnswers[question.id]) {
        fields[question.id] = ['missing-file']
      }
    })
    return fields
  }

  async function submit() {
    const fields = validationErrors()
    if (Object.keys(fields).length) {
      state.feedback = { type: 'validation', fields }
      return null
    }
    state.pending = true
    try {
      state.submitted = await service.submit({
        questionnaireId: questionnaire.id,
        learningSetId: questionnaire.learningSetId,
        textAnswers: Object.entries(state.textAnswers).map(([questionId, value]) => ({ questionId, value })),
        fileAnswers: Object.entries(state.fileAnswers)
          .filter(([, file]) => file)
          .map(([questionId, file]) => ({ questionId, file })),
      }, options)
      state.feedback = { type: 'success' }
      return state.submitted
    } catch (error) {
      state.feedback = error
      return null
    } finally {
      state.pending = false
    }
  }

  return { state, questions, dueDatePassed, canSubmit, setTextAnswer, setFileAnswer, submit, validationErrors }
}
