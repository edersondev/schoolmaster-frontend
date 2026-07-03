import { computed, shallowRef } from 'vue'
import { PLATFORM_SUPPORT_FEEDBACK_STATES } from '@/contracts/platform-support/platformSupportContract'

export function createPlatformSupportRequestKey(parts = []) {
  return parts.map((part) => JSON.stringify(part ?? null)).join('|')
}

export function createStalePlatformSupportFeedback() {
  return { type: PLATFORM_SUPPORT_FEEDBACK_STATES.staleResponse }
}

export function safePlatformSupportDiagnostic(diagnostic = {}) {
  return {
    operationId: diagnostic.operationId ?? null,
    requestId: diagnostic.requestId ?? null,
    status: diagnostic.status ?? 0,
    code: diagnostic.code ?? null,
    routeName: diagnostic.routeName ?? null,
  }
}

export function usePlatformSupportRequestGuards() {
  const activeRequestKey = shallowRef('')
  const staleFeedback = shallowRef(null)
  const hasStaleResponse = computed(() => staleFeedback.value?.type === PLATFORM_SUPPORT_FEEDBACK_STATES.staleResponse)

  function beginRequest(parts = []) {
    const key = createPlatformSupportRequestKey(parts)
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
    staleFeedback.value = createStalePlatformSupportFeedback()
    return true
  }

  return {
    activeRequestKey,
    staleFeedback,
    hasStaleResponse,
    beginRequest,
    isCurrentRequest,
    clearRequest,
    ignoreIfStale,
    safeDiagnostic: safePlatformSupportDiagnostic,
  }
}

