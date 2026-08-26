import { computed, readonly, shallowRef, toValue } from 'vue'
import { ADMIN_RECOVERY_ACTIONS } from '@/contracts/admin-system/administration'
import { useAdminLifecycleAction } from './useAdminLifecycleAction'

export function useUserCreationRecovery(options = {}) {
  const snapshot = shallowRef(null)
  const feedback = shallowRef(null)
  const lifecycle = useAdminLifecycleAction({
    operationId: 'restoreUser',
    routeName: toValue(options.routeName) ?? null,
    now: options.now,
    submitter: ({ values }) => {
      if (!snapshot.value) return null
      return options.restoreUser(snapshot.value.userId, values, {
        schoolId: snapshot.value.schoolId,
      })
    },
  })
  const visible = computed(() => Boolean(snapshot.value))
  const pending = computed(() => lifecycle.pending.value)

  function readContext() {
    return {
      emailSnapshot: String(toValue(options.email) ?? ''),
      schoolId: toValue(options.schoolId) ?? null,
      actorId: toValue(options.actorId) ?? null,
      authorizationGeneration: toValue(options.authorizationGeneration) ?? null,
      routeName: toValue(options.routeName) ?? null,
    }
  }

  function accept(recoveryFeedback) {
    if (
      recoveryFeedback?.code !== 'recoverable_user_conflict' ||
      recoveryFeedback?.status !== 409 ||
      recoveryFeedback?.recoveryAction !== ADMIN_RECOVERY_ACTIONS.restoreUser ||
      typeof recoveryFeedback?.recoveryUserId !== 'string'
    ) {
      clear()
      return false
    }

    lifecycle.invalidate()
    feedback.value = null
    snapshot.value = {
      userId: recoveryFeedback.recoveryUserId,
      ...readContext(),
    }
    return true
  }

  function clear() {
    snapshot.value = null
    feedback.value = null
    lifecycle.invalidate()
  }

  function cancel() {
    snapshot.value = null
    lifecycle.invalidate()
  }

  function invalidateIfContextChanged() {
    if (!snapshot.value) return false
    const current = readContext()
    const stale = Object.entries(current).some(([key, value]) => value !== snapshot.value?.[key])
    if (stale) clear()
    return stale
  }

  function open() {
    if (!snapshot.value || invalidateIfContextChanged()) return false
    lifecycle.launch({ kind: 'user-recovery' }, 'restore')
    return true
  }

  function isRetryable(error) {
    const status = Number(error?.status ?? 0)
    return (
      error?.type === 'validation' ||
      status === 0 ||
      status === 408 ||
      status === 422 ||
      status === 429 ||
      status >= 500
    )
  }

  async function submit() {
    const accepted = snapshot.value
    if (!accepted) return null

    let result
    try {
      result = await lifecycle.submit()
    } catch (error) {
      if (!isRetryable(error)) {
        snapshot.value = null
        feedback.value = error
        lifecycle.invalidate()
      }
      throw error
    }

    if (result === null) return null
    snapshot.value = null
    feedback.value = null
    await options.onRestored?.({
      userId: accepted.userId,
      schoolId: accepted.schoolId,
      result,
    })
    return result
  }

  return {
    visible,
    pending,
    feedback: readonly(feedback),
    dialogOpen: lifecycle.open,
    dialogValues: lifecycle.form,
    dialogAction: lifecycle.action,
    dialogFieldErrors: lifecycle.fieldErrors,
    dialogFormError: lifecycle.formError,
    accept,
    open,
    submit,
    cancel,
    clear,
    invalidate: clear,
    invalidateIfContextChanged,
  }
}
