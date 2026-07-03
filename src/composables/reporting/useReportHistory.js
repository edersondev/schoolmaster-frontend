import { computed, reactive, readonly } from 'vue'
import { reportingService } from '@/services/reporting/reportingService'
import { REPORTING_FEEDBACK_STATES } from '@/contracts/reporting/reportingContract'
import { useReportingRequestGuards } from './useReportingRequestGuards'

export function useReportHistory({ access, service = reportingService } = {}) {
  const guards = useReportingRequestGuards()
  const state = reactive({
    items: [],
    meta: { page: 1, perPage: 25, total: 0 },
    filters: {
      page: 1,
      perPage: 25,
      reportType: '',
      generationStatus: '',
      reportSource: '',
      includeDeleted: false,
    },
    loading: false,
    feedback: null,
    selectedRunId: '',
    lastRefreshedAt: null,
  })

  const selectedRun = computed(() => state.items.find((item) => item.id === state.selectedRunId) ?? null)
  const pendingRuns = computed(() =>
    state.items.filter((item) => ['requested', 'generating'].includes(item.generationStatus)),
  )
  const emptyState = computed(() => {
    if (state.loading || state.feedback) return null
    if (state.items.length > 0) return null
    const filtered = Boolean(
      state.filters.reportType ||
        state.filters.generationStatus ||
        state.filters.reportSource ||
        state.filters.includeDeleted,
    )
    return { type: filtered ? REPORTING_FEEDBACK_STATES.noResults : REPORTING_FEEDBACK_STATES.empty }
  })

  function applyReturnedRun(run) {
    if (!run?.id) return
    const index = state.items.findIndex((item) => item.id === run.id)
    if (index === -1) state.items = [run, ...state.items]
    else state.items.splice(index, 1, run)
    state.selectedRunId = run.id
  }

  async function load(overrides = {}) {
    const schoolId = access?.schoolId?.value ?? access?.schoolId
    if (!schoolId) {
      state.feedback = { type: REPORTING_FEEDBACK_STATES.noActiveSchool }
      return null
    }
    if (!(access?.hasReportAccess?.value ?? access?.hasReportAccess)) {
      state.feedback = { type: REPORTING_FEEDBACK_STATES.forbidden }
      return null
    }
    Object.assign(state.filters, overrides)
    const key = guards.beginRequest(['reports', schoolId, state.filters])
    state.loading = true
    state.feedback = { type: REPORTING_FEEDBACK_STATES.loading }
    try {
      const result = await service.listReports(state.filters, { schoolId })
      if (guards.ignoreIfStale(key)) return null
      state.items = result.items
      state.meta = result.meta
      state.feedback = null
      state.lastRefreshedAt = new Date().toISOString()
      return result
    } catch (error) {
      if (!guards.ignoreIfStale(key)) state.feedback = error
      return null
    } finally {
      if (guards.isCurrentRequest(key)) {
        state.loading = false
        guards.clearRequest(key)
      }
    }
  }

  function setPage(page) {
    return load({ page })
  }

  function selectRun(reportRunId) {
    state.selectedRunId = reportRunId
  }

  return {
    state: readonly(state),
    items: computed(() => state.items),
    selectedRun,
    pendingRuns,
    emptyState,
    load,
    setPage,
    selectRun,
    applyReturnedRun,
  }
}
