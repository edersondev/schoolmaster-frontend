import { computed, reactive, readonly, shallowRef } from 'vue'
import { normalizeAdministrationError } from '@/services/admin-system/administration-error-mapper'

export function useAdminUpdateForm(options = {}) {
  const initialValues = shallowRef(clonePlain(options.initialValues ?? {}))
  const values = reactive(clonePlain(options.initialValues ?? {}))
  const fieldErrors = shallowRef({})
  const formError = shallowRef(null)
  const pending = shallowRef(false)
  const submitted = shallowRef(false)
  const status = shallowRef('idle')

  const isDirty = computed(() => JSON.stringify(values) !== JSON.stringify(initialValues.value))

  function reset(nextValues = options.initialValues ?? {}) {
    initialValues.value = clonePlain(nextValues)
    Object.keys(values).forEach((key) => delete values[key])
    Object.assign(values, clonePlain(nextValues))
    fieldErrors.value = {}
    formError.value = null
    pending.value = false
    submitted.value = false
    status.value = 'idle'
  }

  async function submit() {
    if (pending.value) return null
    const localErrors = options.validate?.(values) ?? {}
    if (Object.keys(localErrors).length > 0) {
      fieldErrors.value = localErrors
      formError.value = {
        type: 'validation',
        messageKey: 'common.validationSummary',
        fieldErrors: localErrors,
      }
      status.value = 'validation'
      throw formError.value
    }

    pending.value = true
    fieldErrors.value = {}
    formError.value = null
    status.value = 'submitting'
    try {
      const result = await options.submitter(values)
      const submittedValues = clonePlain(values)
      reset(options.mapResult ? options.mapResult(result) : submittedValues)
      submitted.value = true
      status.value = 'succeeded'
      return result
    } catch (cause) {
      const normalized = normalizeAdministrationError(cause, {
        operationId: options.operationId,
        routeName: options.routeName,
      })
      fieldErrors.value = normalized.fieldErrors ?? {}
      formError.value = normalized
      status.value = normalized.type
      throw normalized
    } finally {
      pending.value = false
    }
  }

  return {
    values,
    initialValues: readonly(initialValues),
    fieldErrors: readonly(fieldErrors),
    formError: readonly(formError),
    pending: readonly(pending),
    submitted: readonly(submitted),
    status: readonly(status),
    isDirty,
    reset,
    submit,
  }
}

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value ?? {}))
}
