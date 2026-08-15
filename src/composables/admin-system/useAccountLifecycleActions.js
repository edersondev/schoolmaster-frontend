import { computed, onScopeDispose, shallowRef, toValue, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import {
  ACCOUNT_LIFECYCLE_ACTIONS,
  deriveAccountLifecycleEligibility,
  validateAccountLifecycleAction,
} from '@/contracts/admin-system/account-lifecycle'
import { adminAccountLifecycleService } from '@/services/admin-system/accountLifecycle'

export function useAccountLifecycleActions({
  target,
  schoolId,
  actorId = null,
  permissions = [],
  roles = [],
  refreshTarget = null,
  service = adminAccountLifecycleService,
} = {}) {
  const { t } = useI18n()
  const lock = shallowRef(null)
  const loading = shallowRef(false)
  const pending = shallowRef(false)
  const error = shallowRef(null)
  const fieldErrors = shallowRef({})
  const open = shallowRef(false)
  const action = shallowRef('')
  const reason = shallowRef('')
  let generation = 0
  let lockController = null
  let actionController = null
  let pendingSubmission = null

  const currentTarget = computed(() => toValue(target))
  const tenantId = computed(() => toValue(schoolId))
  const eligibility = computed(() =>
    deriveAccountLifecycleEligibility({
      target: currentTarget.value,
      lock: lock.value,
      actorId: toValue(actorId),
      permissions: toValue(permissions) ?? [],
      roles: toValue(roles) ?? [],
      schoolId: tenantId.value,
    }),
  )

  async function refreshTargetRecord() {
    if (typeof refreshTarget === 'function') {
      await refreshTarget()
    }
  }

  async function loadLock() {
    const user = currentTarget.value
    if (!user || !eligibility.value.canReviewLock) return null
    const currentGeneration = generation
    lockController?.abort()
    const controller = new AbortController()
    lockController = controller
    loading.value = true
    error.value = null
    try {
      const response = await service.getAccountLock(user.id, {
        schoolId: tenantId.value ?? undefined,
        signal: controller.signal,
      })
      if (currentGeneration !== generation || controller.signal.aborted) return null
      lock.value = response
      return response
    } catch (loadError) {
      if (currentGeneration !== generation || controller.signal.aborted) return null
      error.value = loadError
      throw loadError
    } finally {
      if (currentGeneration === generation && lockController === controller) loading.value = false
    }
  }

  function launch(nextAction) {
    if (eligibility.value.blocked) return
    action.value = nextAction
    reason.value = ''
    fieldErrors.value = {}
    error.value = null
    open.value = true
  }

  function close() {
    open.value = false
    action.value = ''
    reason.value = ''
    fieldErrors.value = {}
  }

  async function submit() {
    if (pendingSubmission) return pendingSubmission
    const user = currentTarget.value
    if (!user || eligibility.value.blocked || !action.value) return null
    fieldErrors.value = validateAccountLifecycleAction({
      action: action.value,
      reason: reason.value,
    })
    if (Object.keys(fieldErrors.value).length > 0) return null

    const currentGeneration = generation
    actionController?.abort()
    const controller = new AbortController()
    actionController = controller
    const selectedAction = action.value
    const options = { schoolId: tenantId.value ?? undefined, signal: controller.signal }

    pendingSubmission = (async () => {
      pending.value = true
      error.value = null
      try {
        let response
        if (selectedAction === ACCOUNT_LIFECYCLE_ACTIONS.lock) {
          response = await service.lockAccount(user.id, { reason: reason.value }, options)
        } else if (selectedAction === ACCOUNT_LIFECYCLE_ACTIONS.unlock) {
          response = await service.unlockAccount(user.id, options)
        } else {
          response = await service.reactivateAccount(
            user.id,
            { action: selectedAction, reason: reason.value },
            options,
          )
        }
        if (currentGeneration !== generation || controller.signal.aborted) return null
        ElMessage.success(t('administration.common.updateSuccess'))
        close()
        await refreshTargetRecord()
        await loadLock()
        return response
      } catch (submitError) {
        if (currentGeneration !== generation || controller.signal.aborted) return null
        fieldErrors.value = submitError.fieldErrors ?? {}
        error.value = submitError
        if (submitError.type === 'conflict') {
          await refreshTargetRecord()
          await loadLock().catch(() => null)
        }
        throw submitError
      } finally {
        if (currentGeneration === generation) pending.value = false
      }
    })()

    try {
      return await pendingSubmission
    } finally {
      pendingSubmission = null
    }
  }

  function invalidate() {
    generation += 1
    lockController?.abort()
    actionController?.abort()
    loading.value = false
    pending.value = false
    lock.value = null
    close()
  }

  watch(
    [
      currentTarget,
      tenantId,
      () => toValue(actorId),
      () => JSON.stringify(toValue(permissions) ?? []),
      () => JSON.stringify(toValue(roles) ?? []),
    ],
    () => {
      invalidate()
      void loadLock().catch(() => null)
    },
    { immediate: true },
  )
  onScopeDispose(invalidate)

  return {
    lock,
    loading,
    pending,
    error,
    fieldErrors,
    open,
    action,
    reason,
    eligibility,
    loadLock,
    launch,
    close,
    submit,
    invalidate,
  }
}
