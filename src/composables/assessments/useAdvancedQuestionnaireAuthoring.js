import { reactive } from 'vue'
import { questionnaireAuthoringService, validateQuestionnaireDraft } from '@/services/assessments/questionnaireAuthoringService'
import { useAdvancedAssessmentRequestGuards } from './useAdvancedAssessmentRequestGuards'

const emptyQuestion = () => ({
  type: 'long_text',
  prompt: '',
  sequence: 1,
  answerSchema: { minLength: 1, maxLength: 10000, plainTextOnly: true },
  fileRule: { allowedCategories: ['pdf', 'image', 'text', 'office'], maxFiles: 1, maxFileSize: 26214400 },
  gradingRule: { mode: 'manual', maxScore: 100 },
})

const emptyDraft = () => ({
  title: '',
  description: '',
  questions: [emptyQuestion()],
})

export function useAdvancedQuestionnaireAuthoring({ service = questionnaireAuthoringService, options = {} } = {}) {
  const guard = useAdvancedAssessmentRequestGuards()
  const state = reactive({
    loading: false,
    pending: false,
    feedback: null,
    detail: null,
    draft: emptyDraft(),
  })

  async function load(questionnaireId) {
    if (!questionnaireId) {
      state.detail = null
      state.draft = emptyDraft()
      return
    }
    state.loading = true
    const captured = guard.capture(['authoring', questionnaireId, options.schoolId])
    try {
      const record = await service.get(questionnaireId, options)
      if (!guard.isCurrent(captured)) return
      state.detail = record
      state.draft = {
        title: record.title,
        description: record.description,
        questions: record.questions,
      }
      state.feedback = null
    } catch (error) {
      state.feedback = error
    } finally {
      state.loading = false
    }
  }

  async function save() {
    const fields = validateQuestionnaireDraft(state.draft)
    if (Object.keys(fields).length) {
      state.feedback = { type: 'validation', fields }
      return null
    }
    state.pending = true
    try {
      state.detail = state.detail?.id
        ? await service.update(state.detail.id, state.draft, options)
        : await service.create(state.draft, options)
      state.feedback = { type: 'success' }
      return state.detail
    } catch (error) {
      state.feedback = error
      return null
    } finally {
      state.pending = false
    }
  }

  function updateQuestion(index, patch) {
    state.draft.questions[index] = { ...state.draft.questions[index], ...patch }
  }

  function addQuestion(type = 'long_text') {
    state.draft.questions.push({ ...emptyQuestion(), type, sequence: state.draft.questions.length + 1 })
  }

  return { state, load, save, updateQuestion, addQuestion }
}
