import { computed, toValue, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { useAdminList } from './useAdminList'
import { SCHOOL_LIST_FILTER_KEYS, useAdminListQuery } from './useAdminListQuery'

export function useAdministrationResourceList(options) {
  const route = useRoute()
  const router = useRouter()
  const sessionStore = useAuthSessionStore()
  const { activeSchool } = storeToRefs(sessionStore)
  const tenantId = computed(() => (options.tenantOwned ? (activeSchool.value?.id ?? null) : null))
  const { query, update } = useAdminListQuery({ resource: options.resource, route, router })
  const enabled = computed(() => (options.enabled === undefined ? true : Boolean(toValue(options.enabled))))
  const requestQuery = computed(() =>
    options.sanitizeQuery ? options.sanitizeQuery(query.value) : query.value,
  )
  const list = useAdminList({
    loader: options.loader,
    query: requestQuery,
    tenantId,
    operationId: options.operationId,
    routeName: route.name,
    onInvalidPage: (page) => update({ page }),
  })

  watch(
    [requestQuery, tenantId, enabled],
    async ([nextQuery, schoolId, isEnabled], previous = []) => {
      const previousSchoolId = previous[1]
      if (!isEnabled) return
      if (options.tenantOwned && !schoolId) return
      if (
        options.tenantOwned &&
        previousSchoolId &&
        schoolId !== previousSchoolId &&
        options.tenantResetQuery
      ) {
        await update(options.tenantResetQuery)
        return
      }
      list.load(nextQuery)
    },
    { immediate: true, deep: true },
  )

  function resetFilters() {
    const patch = { status: '', sort: '', academicYearId: '', page: 1 }
    if (options.resource === 'schools') {
      for (const key of SCHOOL_LIST_FILTER_KEYS) {
        patch[key] = ''
      }
    }
    return update(patch)
  }

  return {
    ...list,
    query,
    updateQuery: update,
    resetFilters,
    can: (permissions) => permissions.every((permission) => sessionStore.hasPermission(permission)),
  }
}
