import { computed, reactive, readonly } from 'vue'
import { reportingService } from '@/services/reporting/reportingService'
import { REPORTING_FEEDBACK_STATES } from '@/contracts/reporting/reportingContract'
import { useReportingRequestGuards } from './useReportingRequestGuards'

export function useReportCatalog({ access, service = reportingService } = {}) {
  const guards = useReportingRequestGuards()
  const state = reactive({
    catalog: null,
    loading: false,
    feedback: null,
  })

  const domains = computed(() => state.catalog?.domains ?? [])
  const formats = computed(() => state.catalog?.outputFormats ?? [])
  const complexityLimits = computed(() => state.catalog?.complexityLimits ?? {})
  const available = computed(() => Boolean(state.catalog && !state.feedback))

  async function load({ forDefinitions = false } = {}) {
    const schoolId = access?.schoolId?.value ?? access?.schoolId
    const allowed = forDefinitions
      ? (access?.canUseCatalogForDefinitions?.value ?? access?.canUseCatalogForDefinitions)
      : (access?.canUseCatalogForReports?.value ?? access?.canUseCatalogForReports)

    if (!schoolId || !allowed) {
      state.feedback = { type: schoolId ? REPORTING_FEEDBACK_STATES.forbidden : REPORTING_FEEDBACK_STATES.noActiveSchool }
      return null
    }

    const key = guards.beginRequest(['catalog', schoolId, forDefinitions])
    state.loading = true
    state.feedback = { type: REPORTING_FEEDBACK_STATES.loading }
    try {
      const catalog = await service.getReportCatalog({ schoolId })
      if (guards.ignoreIfStale(key)) return null
      state.catalog = catalog
      state.feedback = domains.value.length === 0 ? { type: REPORTING_FEEDBACK_STATES.unavailableCatalog } : null
      return catalog
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

  function isSupportedFormat(format) {
    return formats.value.includes(format)
  }

  function findDomain(domainId) {
    return domains.value.find((domain) => [domain.id, domain.code, domain.name].includes(domainId)) ?? null
  }

  return {
    state: readonly(state),
    domains,
    formats,
    complexityLimits,
    available,
    load,
    isSupportedFormat,
    findDomain,
  }
}
