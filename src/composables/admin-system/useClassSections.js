import { computed, reactive, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ADMIN_FEEDBACK_STATES } from '@/contracts/admin-system/administration'
import { createClassSectionDraft, validateClassSectionDraft } from '@/contracts/admin-system/classroom-roster'
import { createClassSection, getClassSection, listClassSections, updateClassSection, updateClassSectionStatus } from '@/services/admin-system/classroomRoster'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'

export function useClassSections(options = {}) {
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
  const form = reactive(createClassSectionDraft())
  const query = computed(() => ({
    page: Number(route.query.page) || 1,
    perPage: Number(route.query.perPage ?? route.query.per_page) || 25,
    academicPeriodId: route.query.academicPeriodId ?? '',
    status: route.query.status ?? '',
  }))

  async function updateQuery(patch = {}) {
    await router.push({ query: { ...route.query, ...patch, page: patch.page ?? 1 } })
  }

  async function load(input = query.value) {
    if (!tenantId.value || !input.academicPeriodId) {
      status.value = 'no-current-period'
      return
    }
    const id = requestId.value + 1
    requestId.value = id
    status.value = ADMIN_FEEDBACK_STATES.loading
    error.value = null
    try {
      const result = await (options.listLoader ?? listClassSections)(input, { schoolId: tenantId.value })
      if (id !== requestId.value) return
      items.value = result.items
      meta.value = result.meta
      status.value = result.items.length ? ADMIN_FEEDBACK_STATES.ready : ADMIN_FEEDBACK_STATES.empty
    } catch (err) {
      if (id !== requestId.value) return
      error.value = err
      status.value = err.type ?? ADMIN_FEEDBACK_STATES.unknown
    }
  }

  async function loadDetail(classSectionId) {
    const id = requestId.value + 1
    requestId.value = id
    status.value = ADMIN_FEEDBACK_STATES.loading
    try {
      const record = await (options.detailLoader ?? getClassSection)(classSectionId, { schoolId: tenantId.value })
      if (id !== requestId.value) return null
      detail.value = record
      Object.assign(form, createClassSectionDraft(record))
      status.value = ADMIN_FEEDBACK_STATES.ready
      return record
    } catch (err) {
      if (id !== requestId.value) return null
      error.value = err
      status.value = err.type ?? ADMIN_FEEDBACK_STATES.unknown
      return null
    }
  }

  async function save(id = null) {
    fieldErrors.value = validateClassSectionDraft(form)
    if (Object.keys(fieldErrors.value).length > 0) return null
    try {
      return id
        ? await (options.updateLoader ?? updateClassSection)(id, form, { schoolId: tenantId.value })
        : await (options.createLoader ?? createClassSection)(form, { schoolId: tenantId.value })
    } catch (err) {
      fieldErrors.value = err.fieldErrors ?? {}
      error.value = err
      throw err
    }
  }

  async function updateStatus(id, input) {
    return (options.statusLoader ?? updateClassSectionStatus)(id, input, { schoolId: tenantId.value })
  }

  if (options.autoLoad !== false) {
    watch([query, tenantId], () => {
      requestId.value += 1
      if (tenantId.value) load(query.value)
    }, { immediate: true, deep: true })
  }

  return { items, detail, meta, status, error, fieldErrors, form, query, load, loadDetail, save, updateStatus, updateQuery }
}
