import { computed, reactive, readonly, shallowRef } from 'vue'
import {
  formatDateInput,
  LIFECYCLE_BULK_LIMIT,
  validateLifecycleActionForm,
} from '@/contracts/admin-system/lifecycle'
import { normalizeAdministrationError } from '@/services/admin-system/administration-error-mapper'

export function useAdminBulkLifecycle(options = {}) {
  const selected = reactive(new Map())
  const action = shallowRef(null)
  const pending = shallowRef(false)
  const fieldErrors = shallowRef({})
  const formError = shallowRef(null)
  const form = reactive({ effectiveAt: formatDateInput(), reason: '' })
  const selectedIds = computed(() => Array.from(selected.keys()))
  const selectedSummaries = computed(() => Array.from(selected.values()))
  const selectedCount = computed(() => selected.size)
  const overLimit = computed(() => selected.size > LIFECYCLE_BULK_LIMIT)

  function toggle(row, checked = !selected.has(row.id)) {
    if (!row?.id) return
    if (checked) selected.set(row.id, { id: row.id, label: row.name ?? row.fullName ?? row.id, status: row.status })
    else selected.delete(row.id)
  }

  function clearSelection() {
    selected.clear()
    action.value = null
    fieldErrors.value = {}
    formError.value = null
    form.effectiveAt = formatDateInput()
    form.reason = ''
  }

  async function submit(nextAction = action.value) {
    action.value = nextAction
    if (pending.value || selected.size === 0) return null
    if (overLimit.value) {
      formError.value = { type: 'validation', fieldErrors: { ids: ['Select no more than 50 records.'] } }
      throw formError.value
    }
    const localErrors = validateLifecycleActionForm(form, options.now?.() ?? new Date())
    if (Object.keys(localErrors).length > 0) {
      fieldErrors.value = localErrors
      formError.value = { type: 'validation', fieldErrors: localErrors }
      throw formError.value
    }

    pending.value = true
    try {
      const result = await options.submitter({
        action: action.value,
        ids: selectedIds.value,
        effectiveAt: form.effectiveAt,
        reason: form.reason,
      })
      options.onSuccess?.(result)
      clearSelection()
      return result
    } catch (cause) {
      const normalized = normalizeAdministrationError(cause, {
        operationId: options.operationId,
        routeName: options.routeName,
      })
      fieldErrors.value = normalized.fieldErrors ?? {}
      formError.value = normalized
      throw normalized
    } finally {
      pending.value = false
    }
  }

  return {
    selectedIds,
    selectedSummaries,
    selectedCount,
    overLimit,
    action,
    form,
    pending: readonly(pending),
    fieldErrors: readonly(fieldErrors),
    formError: readonly(formError),
    toggle,
    clearSelection,
    submit,
  }
}
