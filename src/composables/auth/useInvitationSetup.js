import { computed, shallowRef, toValue, watch } from 'vue'
import {
  ACCOUNT_LIFECYCLE_FEEDBACK_STATES,
  createAccountLifecycleFeedbackState,
  isMalformedLifecycleToken,
  validateLifecyclePassword,
} from '@/contracts/auth/account-lifecycle'
import { authAccountLifecycleService } from '@/services/auth/accountLifecycle'

export function useInvitationSetup({ token, service = authAccountLifecycleService } = {}) {
  const pending = shallowRef(false)
  const fieldErrors = shallowRef({})
  const feedback = shallowRef(null)
  const result = shallowRef(null)
  let requestId = 0

  const invitationToken = computed(() => String(toValue(token) ?? '').trim())
  const completed = computed(
    () => feedback.value?.state === ACCOUNT_LIFECYCLE_FEEDBACK_STATES.success,
  )
  const tokenInvalid = computed(() => isMalformedLifecycleToken(invitationToken.value))

  watch(
    invitationToken,
    () => {
      requestId += 1
      result.value = null
      fieldErrors.value = {}
      feedback.value = tokenInvalid.value
        ? createAccountLifecycleFeedbackState(ACCOUNT_LIFECYCLE_FEEDBACK_STATES.invalidToken)
        : null
    },
    { immediate: true },
  )

  async function submit(input = {}) {
    const currentRequest = requestId + 1
    requestId = currentRequest
    fieldErrors.value = {}
    result.value = null

    if (tokenInvalid.value) {
      feedback.value = createAccountLifecycleFeedbackState(
        ACCOUNT_LIFECYCLE_FEEDBACK_STATES.invalidToken,
      )
      return null
    }

    const passwordErrors = validateLifecyclePassword(input.password)
    if (passwordErrors.length > 0) {
      fieldErrors.value = { password: passwordErrors }
      feedback.value = createAccountLifecycleFeedbackState(
        ACCOUNT_LIFECYCLE_FEEDBACK_STATES.validation,
      )
      return null
    }

    pending.value = true
    feedback.value = null
    try {
      const response = await service.completeAccountInvitation({
        invitationToken: invitationToken.value,
        password: input.password,
      })
      if (currentRequest !== requestId) return null
      result.value = response
      feedback.value = createAccountLifecycleFeedbackState(ACCOUNT_LIFECYCLE_FEEDBACK_STATES.success)
      return response
    } catch (error) {
      if (currentRequest !== requestId) return null
      fieldErrors.value = error.fieldErrors ?? {}
      feedback.value = error.feedback
      throw error
    } finally {
      if (currentRequest === requestId) {
        pending.value = false
      }
    }
  }

  return {
    token: invitationToken,
    pending,
    fieldErrors,
    feedback,
    result,
    completed,
    tokenInvalid,
    submit,
  }
}

