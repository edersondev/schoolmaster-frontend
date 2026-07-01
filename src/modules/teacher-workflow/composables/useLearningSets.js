import { reactive } from 'vue'
import { TEACHER_WORKFLOW_CONTRACT_GATES } from '../services/teacherWorkflowContract'
import { learningSetService } from '../services/learningSetService'
import { useTeacherWorkflowStaleGuard } from './useTeacherWorkflowStaleGuard'

export function useLearningSets({ service = learningSetService, options = {}, scope = null } = {}) {
  const staleGuard = useTeacherWorkflowStaleGuard()
  const state = reactive({
    loading: false,
    pending: false,
    feedback: null,
    items: [],
    detail: null,
    draft: { title: '', description: '', entries: [], rosterAssignment: null, dueAt: null },
    pagination: { page: 1, perPage: 15, total: 0 },
    gates: TEACHER_WORKFLOW_CONTRACT_GATES,
  })

  async function loadList(query = {}) {
    if (!state.gates.scopedLearningSetList) {
      state.feedback = { type: 'unsupported-contract', code: 'scopedLearningSetList' }
      return
    }
    state.loading = true
    const captured = staleGuard.capture(['learning-sets', scope?.selectedClassSectionId, scope?.selectedAcademicPeriodId])
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
    state.loading = true
    const captured = staleGuard.capture(['learning-set-detail', id])
    try {
      const record = await service.get(id, options)
      if (!staleGuard.isCurrent(captured)) return
      state.detail = record
      state.feedback = null
    } catch (error) {
      state.feedback = error
    } finally {
      state.loading = false
    }
  }

  async function create() {
    if (!state.gates.rosterAwareLearningSetCreate) {
      state.feedback = { type: 'unsupported-contract', code: 'rosterAwareLearningSetCreate' }
      return null
    }
    state.pending = true
    try {
      state.detail = await service.create(state.draft, options)
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

  return { state, loadList, loadDetail, create, lifecycle }
}
