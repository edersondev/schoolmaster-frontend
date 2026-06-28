import { computed, readonly, ref, shallowRef, toValue, watch } from 'vue'
import { normalizeAdministrationError } from '@/services/admin-system/administration-error-mapper'

export function useAdminLookup(options) {
  const items = ref([])
  const selectedItems = ref([])
  const meta = ref({ page: 1, perPage: options.perPage ?? 25, total: 0 })
  const status = shallowRef('idle')
  const error = shallowRef(null)
  let requestSequence = 0
  let tenantGeneration = 0
  let selectionRetentionEnabled = true

  const selectedIds = computed(() => new Set(toValue(options.selectedIds) ?? []))
  const visibleOptions = computed(() => {
    const byId = new Map()
    selectedItems.value.forEach((item) => byId.set(item.id, item))
    items.value.forEach((item) => byId.set(item.id, item))
    return [...byId.values()]
  })
  const pageCount = computed(() => Math.max(1, Math.ceil(meta.value.total / meta.value.perPage)))

  function retainSelected() {
    if (!selectionRetentionEnabled) {
      selectedItems.value = []
      return
    }
    const retained = new Map(
      selectedItems.value
        .filter((item) => selectedIds.value.has(item.id))
        .map((item) => [item.id, item]),
    )
    items.value
      .filter((item) => selectedIds.value.has(item.id))
      .forEach((item) => retained.set(item.id, item))
    selectedItems.value = [...retained.values()]
  }

  async function load(page = 1) {
    const schoolId = options.tenantId ? toValue(options.tenantId) : null
    if (options.tenantOwned !== false && !schoolId) {
      reset()
      return null
    }
    const requestId = ++requestSequence
    const generation = tenantGeneration
    status.value = 'loading'
    error.value = null
    retainSelected()
    try {
      const result = await options.loader(
        {
          page,
          perPage: meta.value.perPage,
          ...(options.status ? { status: options.status } : {}),
        },
        { schoolId },
      )
      if (requestId !== requestSequence || generation !== tenantGeneration) return null
      items.value = result.items
      meta.value = result.meta
      retainSelected()
      status.value = result.items.length ? 'ready' : 'empty'
      return result
    } catch (cause) {
      if (requestId !== requestSequence || generation !== tenantGeneration) return null
      error.value = normalizeAdministrationError(cause, { operationId: options.operationId })
      status.value = error.value.type
      return null
    }
  }

  function reset() {
    requestSequence += 1
    tenantGeneration += 1
    items.value = []
    selectedItems.value = []
    meta.value = { page: 1, perPage: options.perPage ?? 25, total: 0 }
    status.value = 'idle'
    error.value = null
    selectionRetentionEnabled = false
  }

  watch(selectedIds, () => {
    selectionRetentionEnabled = true
    retainSelected()
  })
  if (options.tenantId) {
    watch(options.tenantId, (schoolId) => {
      reset()
      if (schoolId) load(1)
    })
  }

  return {
    items: readonly(items),
    selectedItems: readonly(selectedItems),
    options: visibleOptions,
    meta: readonly(meta),
    pageCount,
    status: readonly(status),
    error: readonly(error),
    load,
    setPage: load,
    nextPage: () => load(Math.min(meta.value.page + 1, pageCount.value)),
    previousPage: () => load(Math.max(meta.value.page - 1, 1)),
    reset,
  }
}
