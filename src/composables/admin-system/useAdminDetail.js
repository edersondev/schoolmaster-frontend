import { readonly, shallowRef, toValue, watch } from 'vue'
import { normalizeAdministrationError } from '@/services/admin-system/administration-error-mapper'

export function useAdminDetail(options = {}) {
  const record = shallowRef(null)
  const status = shallowRef('idle')
  const error = shallowRef(null)
  let requestSequence = 0

  async function load(id = toValue(options.id)) {
    if (!id || (options.schoolRequired && !toValue(options.schoolId))) {
      status.value = options.schoolRequired ? 'inactive-context' : 'not-found'
      record.value = null
      return null
    }

    const requestId = ++requestSequence
    const controller = new AbortController()
    status.value = 'loading'
    error.value = null

    try {
      const result = await options.loader(id, {
        schoolId: toValue(options.schoolId),
        signal: controller.signal,
      })
      if (requestId !== requestSequence) return null
      record.value = result
      status.value = result ? 'ready' : 'not-found'
      return result
    } catch (cause) {
      if (requestId !== requestSequence) return null
      const normalized = normalizeAdministrationError(cause, {
        operationId: options.operationId,
        routeName: toValue(options.routeName),
      })
      error.value = normalized
      status.value = normalized.type
      record.value = null
      return null
    }
  }

  function reset() {
    requestSequence += 1
    record.value = null
    status.value = 'idle'
    error.value = null
  }

  if (options.watchSources) {
    watch(options.watchSources, () => load(), { immediate: true })
  }

  return {
    record: readonly(record),
    status: readonly(status),
    error: readonly(error),
    load,
    retry: load,
    reset,
    reconcile(nextRecord) {
      record.value = nextRecord
      status.value = nextRecord ? 'ready' : status.value
    },
  }
}
