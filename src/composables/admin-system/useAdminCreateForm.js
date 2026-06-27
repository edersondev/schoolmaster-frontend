import { computed, reactive, readonly, shallowRef, toRaw } from 'vue'
import { ADMIN_RECOVERY_ACTIONS } from '@/contracts/admin-system/administration'
import { normalizeAdministrationError } from '@/services/admin-system/administration-error-mapper'

export function useAdminCreateForm(options) {
  const initial = structuredClone(options.initialValues)
  const values = reactive(structuredClone(initial))
  const fieldErrors = shallowRef({})
  const formError = shallowRef(null)
  const status = shallowRef('idle')
  const submitted = shallowRef(false)
  let pendingPromise = null
  let cleanSnapshot = JSON.stringify(initial)

  const isDirty = computed(() => !submitted.value && JSON.stringify(values) !== cleanSnapshot)
  const pending = computed(() => status.value === 'submitting')

  function clearErrors() {
    fieldErrors.value = {}
    formError.value = null
  }

  function buildValidationFeedback(errors) {
    return {
      type: 'validation',
      code: 'validation_failed',
      status: 422,
      messageKey: 'common.validationSummary',
      recoveryAction: ADMIN_RECOVERY_ACTIONS.none,
      fieldErrors: errors,
      operationId: options.operationId ?? null,
      routeName: options.routeName ?? null,
      requestId: null,
    }
  }

  async function submit() {
    if (pendingPromise) return pendingPromise
    clearErrors()
    const validationErrors = options.validate?.(structuredClone(toRaw(values))) ?? {}
    if (Object.keys(validationErrors).length > 0) {
      const feedback = buildValidationFeedback(validationErrors)
      fieldErrors.value = feedback.fieldErrors
      formError.value = feedback
      status.value = feedback.type
      throw feedback
    }
    status.value = 'submitting'
    pendingPromise = Promise.resolve(options.submitter(structuredClone(toRaw(values))))
      .then((result) => {
        status.value = 'succeeded'
        submitted.value = true
        cleanSnapshot = JSON.stringify(values)
        return result
      })
      .catch((cause) => {
        const feedback = normalizeAdministrationError(cause, {
          operationId: options.operationId,
          routeName: options.routeName,
        })
        fieldErrors.value = feedback.fieldErrors
        formError.value = feedback
        status.value = feedback.type
        throw feedback
      })
      .finally(() => {
        pendingPromise = null
      })
    return pendingPromise
  }

  function reset(nextValues = initial) {
    Object.keys(values).forEach((key) => delete values[key])
    Object.assign(values, structuredClone(nextValues))
    cleanSnapshot = JSON.stringify(values)
    submitted.value = false
    status.value = 'idle'
    clearErrors()
  }

  return {
    values,
    fieldErrors: readonly(fieldErrors),
    formError: readonly(formError),
    status: readonly(status),
    submitted: readonly(submitted),
    isDirty,
    pending,
    submit,
    reset,
    clearErrors,
  }
}
