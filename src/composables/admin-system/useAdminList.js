import { readonly, ref, shallowRef, toValue, watch } from 'vue'
import { mapPaginatedEnvelope } from '@/contracts/admin-system/administration'
import { normalizeAdministrationError } from '@/services/admin-system/administration-error-mapper'

export function useAdminList(options) {
  const items = ref([])
  const meta = ref({ page: 1, perPage: 25, total: 0 })
  const status = shallowRef('idle')
  const error = shallowRef(null)
  const generation = shallowRef(0)
  let requestSequence = 0

  async function load(query = options.query ? toValue(options.query) : {}) {
    const requestId = ++requestSequence
    const tenantGeneration = generation.value
    status.value = 'loading'
    error.value = null

    try {
      const result = await options.loader(query, {
        schoolId: options.tenantId ? toValue(options.tenantId) : null,
      })
      if (requestId !== requestSequence || tenantGeneration !== generation.value) return null
      const mapped = result.items && result.meta?.perPage ? result : mapPaginatedEnvelope(result)
      const maxPage = Math.max(1, Math.ceil(mapped.meta.total / mapped.meta.perPage))
      if (mapped.items.length === 0 && mapped.meta.page > maxPage && options.onInvalidPage) {
        await options.onInvalidPage(maxPage)
        return null
      }
      items.value = mapped.items
      meta.value = mapped.meta
      status.value = mapped.items.length
        ? 'ready'
        : Object.keys(query).length > 2
          ? 'filtered-empty'
          : 'empty'
      return mapped
    } catch (cause) {
      if (requestId !== requestSequence || tenantGeneration !== generation.value) return null
      error.value = normalizeAdministrationError(cause, {
        operationId: options.operationId,
        routeName: options.routeName,
      })
      status.value = error.value.type
      return null
    }
  }

  function resetTenant() {
    generation.value += 1
    requestSequence += 1
    items.value = []
    meta.value = { page: 1, perPage: 25, total: 0 }
    error.value = null
    status.value = 'idle'
  }

  if (options.tenantId) watch(options.tenantId, resetTenant)

  return {
    items: readonly(items),
    meta: readonly(meta),
    status: readonly(status),
    error: readonly(error),
    load,
    retry: load,
    resetTenant,
  }
}
