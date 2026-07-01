import { reactive } from 'vue'
import { questionnaireService, validateQuestionnaireDraft } from '../services/questionnaireService'
import { useTeacherWorkflowStaleGuard } from './useTeacherWorkflowStaleGuard'

const emptyDraft = () => ({
  title: '',
  description: '',
  questions: [{ type: 'multiple_choice', prompt: '', options: ['', ''], answer: null }],
})

export function useQuestionnaires({ service = questionnaireService, options = {} } = {}) {
  const staleGuard = useTeacherWorkflowStaleGuard()
  const state = reactive({
    loading: false,
    pending: false,
    feedback: null,
    items: [],
    detail: null,
    draft: emptyDraft(),
    pagination: { page: 1, perPage: 15, total: 0 },
  })

  async function loadList(query = {}) {
    state.loading = true
    const captured = staleGuard.capture(['questionnaires', query.page ?? state.pagination.page])
    try {
      const response = await service.list({ ...state.pagination, ...query }, options)
      if (!staleGuard.isCurrent(captured)) return
      state.items = response.items
      state.feedback = response.items.length ? null : { type: 'empty' }
    } catch (error) {
      state.feedback = error
    } finally {
      state.loading = false
    }
  }

  async function loadDetail(id) {
    if (!id) {
      state.detail = null
      state.draft = emptyDraft()
      return
    }
    state.loading = true
    const captured = staleGuard.capture(['questionnaire-detail', id])
    try {
      const record = await service.get(id, options)
      if (!staleGuard.isCurrent(captured)) return
      state.detail = record
      state.draft = { title: record.title, description: record.description, questions: record.questions }
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

  async function lifecycle(action, status) {
    if (!state.detail) return
    state.pending = true
    try {
      if (action === 'delete') await service.delete(state.detail.id, options)
      else if (action === 'restore') state.detail = await service.restore(state.detail.id, options)
      else state.detail = await service.updateStatus(state.detail.id, status, options)
      state.feedback = { type: 'success' }
    } catch (error) {
      state.feedback = error
    } finally {
      state.pending = false
    }
  }

  return { state, loadList, loadDetail, save, lifecycle }
}
