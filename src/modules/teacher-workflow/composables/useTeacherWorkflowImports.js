import { computed, reactive } from 'vue'
import { importService, validateImportRows } from '../services/importService'

export function useTeacherWorkflowImports({ service = importService, options = {}, canImport = true } = {}) {
  const state = reactive({
    mode: 'grade',
    json: '[]',
    rows: [],
    pending: false,
    feedback: canImport ? null : { type: 'forbidden' },
    result: null,
  })

  const rowCount = computed(() => state.rows.length)

  function parseJson() {
    try {
      const parsed = JSON.parse(state.json || '[]')
      const fields = validateImportRows(parsed)
      if (Object.keys(fields).length) {
        state.feedback = { type: 'validation', fields }
        return false
      }
      state.rows = parsed
      state.feedback = null
      return true
    } catch {
      state.feedback = { type: 'validation', fields: { json: ['Enter valid JSON.'] } }
      return false
    }
  }

  async function submit() {
    if (!canImport) {
      state.feedback = { type: 'forbidden' }
      return null
    }
    if (!parseJson()) return null
    state.pending = true
    try {
      state.result =
        state.mode === 'attendance'
          ? await service.importAttendance(state.rows, options)
          : await service.importGrades(state.rows, options)
      state.json = '[]'
      state.rows = []
      state.feedback = { type: 'success' }
      return state.result
    } catch (error) {
      state.feedback = error
      return null
    } finally {
      state.pending = false
    }
  }

  return { state, rowCount, parseJson, submit }
}
