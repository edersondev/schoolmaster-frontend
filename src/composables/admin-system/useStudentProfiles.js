import { computed, reactive, shallowRef, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { ADMIN_FEEDBACK_STATES } from '@/contracts/admin-system/administration'
import { createStudentProfile, listStudentProfiles, getStudentProfile } from '@/services/admin-system/studentProfiles'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'

export function useStudentProfiles(options = {}) {
  const route = options.route ?? useRoute()
  const router = options.router ?? useRouter()
  const sessionStore = useAuthSessionStore()
  const { activeSchool } = storeToRefs(sessionStore)
  const tenantId = computed(() => options.schoolId?.value ?? activeSchool.value?.id ?? null)
  const items = shallowRef([])
  const detail = shallowRef(null)
  const meta = shallowRef({ page: 1, perPage: 25, total: 0 })
  const status = shallowRef(ADMIN_FEEDBACK_STATES.idle)
  const error = shallowRef(null)
  const fieldErrors = shallowRef({})
  const requestId = shallowRef(0)
  const query = computed(() => ({
    page: Number(route.query.page) || 1,
    perPage: Number(route.query.perPage ?? route.query.per_page) || 25,
    status: route.query.status ?? '',
    search: route.query.search ?? '',
    sort: route.query.sort ?? '',
  }))

  async function updateQuery(patch = {}) {
    await router.push({ query: { ...route.query, ...patch, page: patch.page ?? 1 } })
  }

  async function load(input = query.value) {
    if (!tenantId.value) return
    const id = requestId.value + 1
    requestId.value = id
    status.value = ADMIN_FEEDBACK_STATES.loading
    error.value = null
    try {
      const result = await (options.listLoader ?? listStudentProfiles)(input, { schoolId: tenantId.value })
      if (id !== requestId.value) return
      items.value = result.items
      meta.value = result.meta
      status.value = result.items.length > 0 ? ADMIN_FEEDBACK_STATES.ready : ADMIN_FEEDBACK_STATES.empty
    } catch (err) {
      if (id !== requestId.value) return
      error.value = err
      status.value = err.type ?? ADMIN_FEEDBACK_STATES.unknown
    }
  }

  async function loadDetail(studentProfileId) {
    if (!tenantId.value || !studentProfileId) return
    const id = requestId.value + 1
    requestId.value = id
    status.value = ADMIN_FEEDBACK_STATES.loading
    error.value = null
    try {
      const record = await (options.detailLoader ?? getStudentProfile)(studentProfileId, { schoolId: tenantId.value })
      if (id !== requestId.value) return
      detail.value = record
      status.value = ADMIN_FEEDBACK_STATES.ready
      return record
    } catch (err) {
      if (id !== requestId.value) return null
      error.value = err
      status.value = err.type ?? ADMIN_FEEDBACK_STATES.unknown
      return null
    }
  }

  async function create(form) {
    fieldErrors.value = {}
    try {
      const record = await (options.createLoader ?? createStudentProfile)(form, { schoolId: tenantId.value })
      return record
    } catch (err) {
      fieldErrors.value = err.fieldErrors ?? {}
      error.value = err
      throw err
    }
  }

  function resetFilters() {
    return updateQuery({ status: '', sort: '', search: '', page: 1 })
  }

  if (options.autoLoad !== false) {
    watch([query, tenantId], () => {
      requestId.value += 1
      if (tenantId.value) load(query.value)
    }, { immediate: true, deep: true })
  }

  return { items, detail, meta, status, error, fieldErrors, query, load, loadDetail, create, updateQuery, resetFilters }
}

export function createStudentProfilesPageState() {
  return reactive({ transferOpen: false, statusOpen: false })
}
