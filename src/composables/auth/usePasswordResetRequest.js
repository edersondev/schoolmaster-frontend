import { computed, shallowRef } from 'vue'
import {
  ACCOUNT_LIFECYCLE_FEEDBACK_STATES,
  createAccountLifecycleFeedbackState,
} from '@/contracts/auth/account-lifecycle'
import { authAccountLifecycleService } from '@/services/auth/accountLifecycle'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function usePasswordResetRequest({ service = authAccountLifecycleService } = {}) {
  const pending = shallowRef(false)
  const fieldErrors = shallowRef({})
  const feedback = shallowRef(null)
  const completed = computed(
    () => feedback.value?.state === ACCOUNT_LIFECYCLE_FEEDBACK_STATES.neutralConfirmation,
  )

  function validate(input = {}) {
    const errors = {}
    const email = String(input.email ?? '').trim()

    if (!email) {
      errors.email = ['Email is required.']
    } else if (!emailPattern.test(email)) {
      errors.email = ['Enter a valid email address.']
    }

    return errors
  }

  async function submit(input = {}) {
    fieldErrors.value = validate(input)
    feedback.value = null
    if (Object.keys(fieldErrors.value).length > 0) {
      feedback.value = createAccountLifecycleFeedbackState(
        ACCOUNT_LIFECYCLE_FEEDBACK_STATES.validation,
      )
      return null
    }

    pending.value = true
    try {
      const result = await service.requestPasswordReset({ email: input.email })
      feedback.value =
        result.feedback ??
        createAccountLifecycleFeedbackState(
          ACCOUNT_LIFECYCLE_FEEDBACK_STATES.neutralConfirmation,
        )
      return result
    } catch (error) {
      fieldErrors.value = error.fieldErrors ?? {}
      feedback.value = error.feedback
      throw error
    } finally {
      pending.value = false
    }
  }

  return {
    pending,
    fieldErrors,
    feedback,
    completed,
    submit,
  }
}

