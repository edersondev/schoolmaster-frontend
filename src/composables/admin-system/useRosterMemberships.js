import { computed, reactive, shallowRef } from 'vue'
import {
  ROSTER_BATCH_LIMIT,
  createRosterMembershipBatchDraft,
  uniqueIds,
  validateRosterBatchAddDraft,
  validateRosterBatchEndDraft,
} from '@/contracts/admin-system/classroom-roster'
import {
  batchAddClassSectionMemberships,
  batchEndClassSectionMemberships,
  listClassSectionMemberships,
} from '@/services/admin-system/classroomRoster'

export function useRosterMemberships(options = {}) {
  const items = shallowRef([])
  const meta = shallowRef({ page: 1, perPage: 25, total: 0 })
  const status = shallowRef('idle')
  const error = shallowRef(null)
  const fieldErrors = shallowRef({})
  const batch = reactive(createRosterMembershipBatchDraft())
  const selectedStudentIds = shallowRef([])
  const selectedMembershipIds = shallowRef([])
  const selectedCount = computed(() => Math.max(selectedStudentIds.value.length, selectedMembershipIds.value.length))
  const oversized = computed(() => selectedCount.value > ROSTER_BATCH_LIMIT)

  async function load(classSectionId, query = {}) {
    status.value = 'loading'
    try {
      const result = await (options.listLoader ?? listClassSectionMemberships)(classSectionId, query, options.serviceOptions?.())
      items.value = result.items
      meta.value = result.meta
      status.value = result.items.length ? 'ready' : 'empty'
    } catch (err) {
      error.value = err
      status.value = err.type ?? 'unknown'
    }
  }

  function setStudentSelection(ids = []) {
    selectedStudentIds.value = uniqueIds(ids)
    batch.studentProfileIds = selectedStudentIds.value
  }

  function setMembershipSelection(ids = []) {
    selectedMembershipIds.value = uniqueIds(ids)
    batch.rosterMembershipIds = selectedMembershipIds.value
  }

  async function submitAdd(classSectionId) {
    fieldErrors.value = validateRosterBatchAddDraft(batch)
    if (Object.keys(fieldErrors.value).length > 0) return null
    return submit(() => (options.addLoader ?? batchAddClassSectionMemberships)(classSectionId, batch, options.serviceOptions?.()))
  }

  async function submitEnd(classSectionId) {
    fieldErrors.value = validateRosterBatchEndDraft(batch)
    if (Object.keys(fieldErrors.value).length > 0) return null
    return submit(() => (options.endLoader ?? batchEndClassSectionMemberships)(classSectionId, batch, options.serviceOptions?.()))
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

  return {
    items,
    meta,
    status,
    error,
    fieldErrors,
    batch,
    selectedStudentIds,
    selectedMembershipIds,
    selectedCount,
    oversized,
    load,
    setStudentSelection,
    setMembershipSelection,
    submitAdd,
    submitEnd,
  }
}
