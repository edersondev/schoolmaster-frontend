import { readonly, ref, shallowRef, toValue, watch } from 'vue'
import { listStudentProfiles } from '@/services/admin-system/student-profiles'

export function useStudentProfileLookup(options = {}) {
  const service = options.service ?? listStudentProfiles
  const optionsList = ref([])
  const loading = shallowRef(false)
  const error = shallowRef(null)
  const page = shallowRef(1)
  const total = shallowRef(0)
  let requestId = 0

  async function search(search = '', nextPage = 1) {
    const currentRequest = ++requestId
    loading.value = true
    error.value = null
    try {
      const result = await service(
        { search: search || undefined, page: nextPage, perPage: 25, sort: 'full_name' },
        { schoolId: options.tenantId ? toValue(options.tenantId) : null },
      )
      if (currentRequest !== requestId) return
      const selected = new Set(options.selectedIds ? toValue(options.selectedIds) : [])
      const retained = optionsList.value.filter((item) => selected.has(item.id))
      optionsList.value = [...retained, ...result.items.filter((item) => !selected.has(item.id))]
      page.value = result.meta.page
      total.value = result.meta.total
    } catch (cause) {
      if (currentRequest === requestId) error.value = cause
    } finally {
      if (currentRequest === requestId) loading.value = false
    }
  }

  function reset() {
    requestId += 1
    optionsList.value = []
    page.value = 1
    total.value = 0
    error.value = null
    loading.value = false
  }

  if (options.tenantId) watch(options.tenantId, reset)

  return {
    options: readonly(optionsList),
    loading: readonly(loading),
    error: readonly(error),
    page: readonly(page),
    total: readonly(total),
    search,
    reset,
  }
}
