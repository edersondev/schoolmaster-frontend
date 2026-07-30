import { computed, getCurrentScope, onScopeDispose, ref } from 'vue'
import { schoolSelectionService } from '@/services/auth/schoolSelectionService'

function normalizeFilters(filters = {}) {
  return {
    name: String(filters.name ?? '').trim(),
    inepCode: String(filters.inepCode ?? '').trim(),
  }
}

export function useSchoolSelection({ service = schoolSelectionService } = {}) {
  const schools = ref([])
  const meta = ref({ page: 1, perPage: 25, total: 0 })
  const filters = ref(normalizeFilters())
  const status = ref('idle')
  const error = ref(null)
  let requestGeneration = 0
  let controller = null

  const hasFilters = computed(() => Boolean(filters.value.name || filters.value.inepCode))
  const isLoading = computed(() => status.value === 'loading')

  async function load({ page = meta.value.page, nextFilters = filters.value } = {}) {
    controller?.abort()
    controller = new AbortController()
    const generation = ++requestGeneration
    const normalizedFilters = normalizeFilters(nextFilters)
    status.value = 'loading'
    error.value = null

    try {
      const result = await service.listActiveSchools({
        page,
        perPage: 25,
        ...normalizedFilters,
        signal: controller.signal,
      })
      if (generation !== requestGeneration) return null

      filters.value = normalizedFilters
      schools.value = result.items
      meta.value = result.meta
      status.value = result.items.length ? 'ready' : hasFilters.value ? 'filtered-empty' : 'empty'
      return result
    } catch (caught) {
      if (
        generation !== requestGeneration ||
        caught?.name === 'CanceledError' ||
        caught?.name === 'AbortError'
      ) {
        return null
      }
      error.value = caught
      status.value = 'error'
      throw caught
    }
  }

  const search = (nextFilters) => load({ page: 1, nextFilters })
  const clearFilters = () => load({ page: 1, nextFilters: normalizeFilters() })
  const goToPage = (page) => load({ page, nextFilters: filters.value })
  const refresh = () => load({ page: meta.value.page, nextFilters: filters.value })
  const retry = refresh

  if (getCurrentScope()) {
    onScopeDispose(() => {
      requestGeneration += 1
      controller?.abort()
    })
  }

  return {
    schools,
    meta,
    filters,
    status,
    error,
    hasFilters,
    isLoading,
    load,
    search,
    clearFilters,
    goToPage,
    refresh,
    retry,
  }
}
