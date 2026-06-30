import { computed, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { mapAcademicPeriodScope } from '@/contracts/admin-system/classroom-roster'
import { listAcademicPeriods } from '@/services/admin-system/academic-periods'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'

export function useAcademicPeriodScope(options = {}) {
  const route = options.route ?? useRoute()
  const router = options.router ?? useRouter()
  const sessionStore = useAuthSessionStore()
  const { activeSchool } = storeToRefs(sessionStore)
  const periods = shallowRef([])
  const loading = shallowRef(false)
  const error = shallowRef(null)
  const selectedAcademicPeriodId = shallowRef(String(route.query.academicPeriodId ?? ''))
  const requestId = shallowRef(0)
  const tenantId = computed(() => options.schoolId?.value ?? activeSchool.value?.id ?? null)
  const currentPeriod = computed(() => periods.value.find((period) => period.isCurrent) ?? null)
  const selectedPeriod = computed(
    () =>
      periods.value.find((period) => period.academicPeriodId === selectedAcademicPeriodId.value) ??
      currentPeriod.value,
  )
  const blocked = computed(() => !loading.value && !selectedPeriod.value)

  async function load() {
    if (!tenantId.value) return
    const id = requestId.value + 1
    requestId.value = id
    loading.value = true
    error.value = null
    try {
      const result = await (options.loader ?? listAcademicPeriods)(
        { status: 'active', perPage: 100 },
        { schoolId: tenantId.value },
      )
      if (id !== requestId.value) return
      periods.value = result.items.map(mapAcademicPeriodScope)
      if (!selectedAcademicPeriodId.value && currentPeriod.value) {
        await selectPeriod(currentPeriod.value.academicPeriodId, { replace: true })
      }
    } catch (err) {
      if (id === requestId.value) error.value = err
    } finally {
      if (id === requestId.value) loading.value = false
    }
  }

  async function selectPeriod(academicPeriodId, { replace = false } = {}) {
    selectedAcademicPeriodId.value = academicPeriodId ?? ''
    const location = {
      query: {
        ...route.query,
        academicPeriodId: selectedAcademicPeriodId.value || undefined,
      },
    }
    await (replace ? router.replace(location) : router.push(location))
  }

  function resetForTenantChange() {
    periods.value = []
    selectedAcademicPeriodId.value = ''
    requestId.value += 1
  }

  watch(
    () => route.query.academicPeriodId,
    (value) => {
      selectedAcademicPeriodId.value = String(value ?? '')
    },
  )

  watch(tenantId, (value, previous) => {
    if (value !== previous) resetForTenantChange()
    if (value) load()
  }, { immediate: true })

  return {
    periods,
    loading,
    error,
    selectedAcademicPeriodId,
    selectedPeriod,
    currentPeriod,
    blocked,
    load,
    selectPeriod,
    resetForTenantChange,
  }
}
