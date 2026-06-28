import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { useAdminList } from './useAdminList'
import { useAdminListQuery } from './useAdminListQuery'

export function useAdministrationResourceList(options) {
  const route = useRoute()
  const router = useRouter()
  const sessionStore = useAuthSessionStore()
  const { activeSchool } = storeToRefs(sessionStore)
  const tenantId = computed(() => (options.tenantOwned ? (activeSchool.value?.id ?? null) : null))
  const { query, update } = useAdminListQuery({ resource: options.resource, route, router })
  const list = useAdminList({
    loader: options.loader,
    query,
    tenantId,
    operationId: options.operationId,
    routeName: route.name,
    onInvalidPage: (page) => update({ page }),
  })

  watch(
    [query, tenantId],
    async ([, schoolId], previous = []) => {
      const previousSchoolId = previous[1]
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
      list.load(query.value)
    },
    { immediate: true, deep: true },
  )

  return {
    ...list,
    query,
    updateQuery: update,
    resetFilters: () => update({ status: '', sort: '', academicYearId: '', page: 1 }),
    can: (permissions) => permissions.every((permission) => sessionStore.hasPermission(permission)),
  }
}
