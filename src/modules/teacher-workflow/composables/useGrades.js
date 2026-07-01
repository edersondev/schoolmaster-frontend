import { reactive } from 'vue'
import { TEACHER_WORKFLOW_CONTRACT_GATES } from '../services/teacherWorkflowContract'
import { gradeService } from '../services/gradeService'
import { useTeacherWorkflowStaleGuard } from './useTeacherWorkflowStaleGuard'

export function validateCorrectionReason(reason) {
  const length = String(reason ?? '').trim().length
  if (length < 10) return 'Use at least 10 characters.'
  if (length > 500) return 'Use 500 characters or fewer.'
  return ''
}

export function validateGradeCorrectionDraft(draft = {}) {
  const errors = {}
  const value = Number(draft.gradeValue)
  if (draft.gradeValue === null || draft.gradeValue === '' || Number.isNaN(value)) {
    errors.gradeValue = ['Corrected grade is required.']
  } else if (value < 0 || value > 100) {
    errors.gradeValue = ['Use a grade from 0 to 100.']
  }

  const reasonError = validateCorrectionReason(draft.correctionReason)
  if (reasonError) errors.correctionReason = [reasonError]
  return errors
}

export function useGrades({ service = gradeService, options = {} } = {}) {
  const staleGuard = useTeacherWorkflowStaleGuard()
  const state = reactive({
    loading: false,
    pending: false,
    feedback: null,
    items: [],
    detail: null,
    draft: { studentProfileId: '', academicPeriodId: '', gradeValue: null, gradeLabel: '' },
    correctionDraft: { gradeValue: null, gradeLabel: '', correctionReason: '' },
    gates: TEACHER_WORKFLOW_CONTRACT_GATES,
  })

  async function loadList(query = {}) {
    if (!state.gates.scopedGradeList) {
      state.feedback = { type: 'unsupported-contract', code: 'scopedGradeList' }
      return
    }
    state.loading = true
    const captured = staleGuard.capture(['grades', query.academicPeriodId, query.classSectionId])
    try {
      const response = await service.list(query, options)
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
    try {
      state.detail = await service.get(id, options)
      state.feedback = null
    } catch (error) {
      state.feedback = error
    } finally {
      state.loading = false
    }
  }

  async function create() {
    state.pending = true
    try {
      state.detail = await service.create(state.draft, options)
      state.feedback = { type: 'success' }
      return state.detail
    } catch (error) {
      state.feedback = error
      return null
    } finally {
      state.pending = false
    }
  }

  async function correct() {
    const fields = validateGradeCorrectionDraft(state.correctionDraft)
    if (Object.keys(fields).length) {
      state.feedback = { type: 'validation', fields }
      return null
    }
    state.pending = true
    try {
      state.detail = await service.correct(state.detail.id, state.correctionDraft, options)
      state.feedback = { type: 'success' }
      return state.detail
    } catch (error) {
      state.feedback = error
      return null
    } finally {
      state.pending = false
    }
  }

  return { state, loadList, loadDetail, create, correct }
}
