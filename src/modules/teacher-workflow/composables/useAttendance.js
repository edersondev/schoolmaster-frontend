import { reactive } from 'vue'
import { TEACHER_WORKFLOW_CONTRACT_GATES } from '../services/teacherWorkflowContract'
import { attendanceService } from '../services/attendanceService'
import { validateCorrectionReason } from './useGrades'

export function useAttendance({ service = attendanceService, options = {} } = {}) {
  const state = reactive({
    loading: false,
    pending: false,
    feedback: null,
    items: [],
    detail: null,
    draft: { studentProfileId: '', academicPeriodId: '', attendanceDate: '', attendanceStatus: 'present' },
    correctionDraft: { attendanceStatus: 'present', correctionReason: '' },
    gates: TEACHER_WORKFLOW_CONTRACT_GATES,
  })

  async function loadList(query = {}) {
    if (!state.gates.scopedAttendanceList) {
      state.feedback = { type: 'unsupported-contract', code: 'scopedAttendanceList' }
      return
    }
    state.loading = true
    try {
      const response = await service.list(query, options)
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
    const reasonError = validateCorrectionReason(state.correctionDraft.correctionReason)
    if (reasonError) {
      state.feedback = { type: 'validation', fields: { correctionReason: [reasonError] } }
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
