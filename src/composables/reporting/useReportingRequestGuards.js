import { computed, shallowRef } from 'vue'
import { REPORTING_FEEDBACK_STATES } from '@/contracts/reporting/reportingContract'

export function createReportingRequestKey(parts = []) {
  return parts.map((part) => JSON.stringify(part ?? null)).join('|')
}

export function createStaleReportingFeedback() {
  return { type: REPORTING_FEEDBACK_STATES.staleResponse }
}

export function useReportingRequestGuards() {
  const activeRequestKey = shallowRef('')
  const staleFeedback = shallowRef(null)
  const hasStaleResponse = computed(() => staleFeedback.value?.type === REPORTING_FEEDBACK_STATES.staleResponse)

  function beginRequest(parts = []) {
    const key = createReportingRequestKey(parts)
    activeRequestKey.value = key
    staleFeedback.value = null
    return key
  }

  function isCurrentRequest(key) {
    return key && key === activeRequestKey.value
  }

  function clearRequest(key = activeRequestKey.value) {
    if (isCurrentRequest(key)) activeRequestKey.value = ''
  }

  function ignoreIfStale(key) {
    if (isCurrentRequest(key)) return false
    staleFeedback.value = createStaleReportingFeedback()
    return true
  }

  function safeDiagnostic(diagnostic = {}) {
    return {
      operationId: diagnostic.operationId ?? null,
      requestId: diagnostic.requestId ?? null,
      status: diagnostic.status ?? 0,
      code: diagnostic.code ?? null,
      routeName: diagnostic.routeName ?? null,
    }
  }

  return {
    activeRequestKey,
    staleFeedback,
    hasStaleResponse,
    beginRequest,
    isCurrentRequest,
    clearRequest,
    ignoreIfStale,
    safeDiagnostic,
  }
}
