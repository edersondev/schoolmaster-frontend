import { computed, reactive } from 'vue'
import { validateFileSelection, validateLongTextAnswer } from '@/contracts/assessments/studentResponsePayloadMapper'
import { studentResponseSubmissionService } from '@/services/assessments/studentResponseSubmissionService'
import { useAdvancedAssessmentRequestGuards } from './useAdvancedAssessmentRequestGuards'

export function useStudentAdvancedResponse({ service = studentResponseSubmissionService, questionnaire = {}, options = {} } = {}) {
  const guard = useAdvancedAssessmentRequestGuards()
  const state = reactive({
    questionnaire,
    loading: false,
    pending: false,
    feedback: null,
    submitted: null,
    textAnswers: {},
    fileAnswers: {},
  })

  const questions = computed(() => state.questionnaire.questions ?? [])
  const dueDatePassed = computed(() =>
    state.questionnaire.dueDate ? Date.now() > new Date(state.questionnaire.dueDate).getTime() : false,
  )
  const canSubmit = computed(() => !state.loading && !state.pending && !state.submitted && !dueDatePassed.value)

  function resetAnswers() {
    state.textAnswers = {}
    state.fileAnswers = {}
  }

  function setQuestionnaire(record = {}) {
    state.questionnaire = record
    state.submitted = null
    resetAnswers()
  }

  async function load(questionnaireId) {
    if (!questionnaireId) {
      setQuestionnaire({})
      state.feedback = { type: 'validation', gate: 'questionnaire' }
      return null
    }
    state.loading = true
    const captured = guard.capture(['student-response', questionnaireId, options.schoolId])
    try {
      const record = await service.get(questionnaireId, options)
      if (!guard.isCurrent(captured)) return null
      setQuestionnaire(record)
      state.feedback = null
      return record
    } catch (error) {
      state.feedback = error
      return null
    } finally {
      state.loading = false
    }
  }

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
    if (!state.questionnaire.id) fields.questionnaire = ['missing-questionnaire']
    if (!questions.value.length) fields.questions = ['missing-questions']
    questions.value.forEach((question) => {
      if (['multiple_choice', 'true_false', 'short_text', 'long_text'].includes(question.type)) {
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
        questionnaireId: state.questionnaire.id,
        learningSetId: state.questionnaire.learningSetId,
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

  return { state, questions, dueDatePassed, canSubmit, load, setQuestionnaire, setTextAnswer, setFileAnswer, submit, validationErrors }
}
