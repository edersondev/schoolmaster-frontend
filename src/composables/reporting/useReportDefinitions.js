import { computed, reactive, readonly } from 'vue'
import { REPORTING_FEEDBACK_STATES } from '@/contracts/reporting/reportingContract'
import { reportingService } from '@/services/reporting/reportingService'
import { useReportingRequestGuards } from './useReportingRequestGuards'

export function useReportDefinitions({ access, service = reportingService } = {}) {
  const guards = useReportingRequestGuards()
  const state = reactive({
    items: [],
    meta: { page: 1, perPage: 25, total: 0 },
    filters: { page: 1, perPage: 25, lifecycleState: '', includeDeleted: false },
    loading: false,
    feedback: null,
    selectedDefinitionId: '',
  })

  const selectedDefinition = computed(() =>
    state.items.find((item) => item.id === state.selectedDefinitionId) ?? null,
  )
  const emptyState = computed(() =>
    !state.loading && !state.feedback && state.items.length === 0
      ? { type: state.filters.lifecycleState || state.filters.includeDeleted ? REPORTING_FEEDBACK_STATES.noResults : REPORTING_FEEDBACK_STATES.empty }
      : null,
  )

  function applyDefinition(definition) {
    if (!definition?.id) return
    const index = state.items.findIndex((item) => item.id === definition.id)
    if (index === -1) state.items = [definition, ...state.items]
    else state.items.splice(index, 1, definition)
    state.selectedDefinitionId = definition.id
  }

  async function load(overrides = {}) {
    const schoolId = access?.schoolId?.value ?? access?.schoolId
    if (!schoolId) {
      state.feedback = { type: REPORTING_FEEDBACK_STATES.noActiveSchool }
      return null
    }
    if (!(access?.hasDefinitionAccess?.value ?? access?.hasDefinitionAccess)) {
      state.feedback = { type: REPORTING_FEEDBACK_STATES.forbidden }
      return null
    }
    Object.assign(state.filters, overrides)
    const key = guards.beginRequest(['definitions', schoolId, state.filters])
    state.loading = true
    state.feedback = { type: REPORTING_FEEDBACK_STATES.loading }
    try {
      const result = await service.listReportDefinitions(state.filters, { schoolId })
      if (guards.ignoreIfStale(key)) return null
      state.items = result.items
      state.meta = result.meta
      state.feedback = null
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

  function selectDefinition(reportDefinitionId) {
    state.selectedDefinitionId = reportDefinitionId
  }

  return {
    state: readonly(state),
    items: computed(() => state.items),
    selectedDefinition,
    emptyState,
    load,
    selectDefinition,
    applyDefinition,
  }
}
