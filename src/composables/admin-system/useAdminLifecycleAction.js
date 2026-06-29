import { computed, reactive, readonly, shallowRef } from 'vue'
import {
  formatDateInput,
  validateLifecycleActionForm,
} from '@/contracts/admin-system/lifecycle'
import { normalizeAdministrationError } from '@/services/admin-system/administration-error-mapper'

export function useAdminLifecycleAction(options = {}) {
  const open = shallowRef(false)
  const target = shallowRef(null)
  const action = shallowRef(null)
  const pending = shallowRef(false)
  const fieldErrors = shallowRef({})
  const formError = shallowRef(null)
  const outcome = shallowRef(null)
  const form = reactive({ effectiveAt: formatDateInput(), reason: '' })
  let requestSequence = 0

  const isDirty = computed(() => open.value && Boolean(form.reason || form.effectiveAt !== formatDateInput()))

  function launch(nextTarget, nextAction) {
    target.value = nextTarget
    action.value = nextAction
    form.effectiveAt = formatDateInput()
    form.reason = ''
    fieldErrors.value = {}
    formError.value = null
    outcome.value = null
    open.value = true
  }

  function close() {
    open.value = false
    target.value = null
    action.value = null
    form.effectiveAt = formatDateInput()
    form.reason = ''
    fieldErrors.value = {}
    formError.value = null
  }

  async function submit() {
    if (pending.value || !target.value || !action.value) return null
    const localErrors = validateLifecycleActionForm(form, options.now?.() ?? new Date())
    if (Object.keys(localErrors).length > 0) {
      fieldErrors.value = localErrors
      formError.value = { type: 'validation', fieldErrors: localErrors }
      throw formError.value
    }

    const requestId = ++requestSequence
    pending.value = true
    fieldErrors.value = {}
    formError.value = null

    try {
      const result = await options.submitter({
        target: target.value,
        action: action.value,
        values: { ...form },
      })
      if (requestId !== requestSequence) return null
      outcome.value = result
      options.onSuccess?.(result)
      close()
      return result
    } catch (cause) {
      if (requestId !== requestSequence) return null
      const normalized = normalizeAdministrationError(cause, {
        operationId: options.operationId,
        routeName: options.routeName,
      })
      fieldErrors.value = normalized.fieldErrors ?? {}
      formError.value = normalized
      throw normalized
    } finally {
      if (requestId === requestSequence) pending.value = false
    }
  }

  return {
    open,
    target: readonly(target),
    action: readonly(action),
    form,
    pending: readonly(pending),
    fieldErrors: readonly(fieldErrors),
    formError: readonly(formError),
    outcome: readonly(outcome),
    isDirty,
    launch,
    close,
    submit,
  }
}
