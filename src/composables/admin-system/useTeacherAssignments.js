import { computed, reactive, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  createTeacherAssignmentDeactivateDraft,
  createTeacherAssignmentDraft,
  validateTeacherAssignmentDeactivateDraft,
  validateTeacherAssignmentDraft,
} from '@/contracts/admin-system/teacher-assignments'
import {
  createTeacherAssignment,
  getTeacherAssignment,
  listTeacherAssignments,
  updateTeacherAssignmentStatus,
} from '@/services/admin-system/teacherAssignments'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'

export function useTeacherAssignments(options = {}) {
  const route = options.route ?? useRoute()
  const router = options.router ?? useRouter()
  const sessionStore = useAuthSessionStore()
  const { activeSchool } = storeToRefs(sessionStore)
  const tenantId = computed(() => options.schoolId?.value ?? activeSchool.value?.id ?? null)
  const items = shallowRef([])
  const detail = shallowRef(null)
  const meta = shallowRef({ page: 1, perPage: 25, total: 0 })
  const status = shallowRef('idle')
  const error = shallowRef(null)
  const fieldErrors = shallowRef({})
  const form = reactive(createTeacherAssignmentDraft())
  const deactivateForm = reactive(createTeacherAssignmentDeactivateDraft())
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
    status.value = 'loading'
    try {
      const result = await (options.listLoader ?? listTeacherAssignments)(input, { schoolId: tenantId.value })
      items.value = result.items
      meta.value = result.meta
      status.value = result.items.length ? 'ready' : 'empty'
    } catch (err) {
      error.value = err
      status.value = err.type ?? 'unknown'
    }
  }

  async function loadDetail(id) {
    status.value = 'loading'
    try {
      detail.value = await (options.detailLoader ?? getTeacherAssignment)(id, { schoolId: tenantId.value })
      status.value = 'ready'
      return detail.value
    } catch (err) {
      error.value = err
      status.value = err.type ?? 'unknown'
      return null
    }
  }

  async function create() {
    fieldErrors.value = validateTeacherAssignmentDraft(form)
    if (Object.keys(fieldErrors.value).length > 0) return null
    return submit(() => (options.createLoader ?? createTeacherAssignment)(form, { schoolId: tenantId.value }))
  }

  async function deactivate(id) {
    fieldErrors.value = validateTeacherAssignmentDeactivateDraft(deactivateForm)
    if (Object.keys(fieldErrors.value).length > 0) return null
    return submit(() => (options.statusLoader ?? updateTeacherAssignmentStatus)(id, deactivateForm, { schoolId: tenantId.value }))
  }

  async function submit(fn) {
    status.value = 'loading'
    try {
      const result = await fn()
      status.value = 'ready'
      return result
    } catch (err) {
      fieldErrors.value = err.fieldErrors ?? {}
      error.value = err
      status.value = err.type ?? 'unknown'
      throw err
    }
  }

  if (options.autoLoad !== false) {
    watch([query, tenantId], () => {
      if (tenantId.value) load(query.value)
    }, { immediate: true, deep: true })
  }

  return { items, detail, meta, status, error, fieldErrors, form, deactivateForm, query, load, loadDetail, create, deactivate, updateQuery }
}
