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
  routeName = null,
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
  const delivery = shallowRef(null)
  const deliveryPending = shallowRef(false)
  const deliveryError = shallowRef(null)
  let generation = 0
  let lockController = null
  let actionController = null
  let deliveryController = null
  let pendingSubmission = null
  let pendingDelivery = null

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

  async function requestPasswordDelivery() {
    if (pendingDelivery) return pendingDelivery
    const user = currentTarget.value
    if (!user || !eligibility.value.canDeliverPassword) return null

    const currentGeneration = generation
    deliveryController?.abort()
    const controller = new AbortController()
    deliveryController = controller
    const options = { schoolId: tenantId.value ?? undefined, signal: controller.signal }

    const submission = (async () => {
      deliveryPending.value = true
      deliveryError.value = null
      delivery.value = null
      try {
        const response = await service.requestUserPasswordDelivery(user.id, options)
        if (currentGeneration !== generation || controller.signal.aborted) return null
        delivery.value = response
        ElMessage.success(t('accountLifecycle.delivery.accepted'))
        return response
      } catch (requestError) {
        if (currentGeneration !== generation || controller.signal.aborted) return null
        deliveryError.value = requestError
        throw requestError
      } finally {
        if (currentGeneration === generation && deliveryController === controller) {
          deliveryPending.value = false
        }
      }
    })()
    pendingDelivery = submission

    try {
      return await submission
    } finally {
      if (pendingDelivery === submission) pendingDelivery = null
    }
  }

  function invalidate() {
    generation += 1
    lockController?.abort()
    actionController?.abort()
    deliveryController?.abort()
    loading.value = false
    pending.value = false
    deliveryPending.value = false
    lock.value = null
    delivery.value = null
    deliveryError.value = null
    pendingDelivery = null
    close()
  }

  watch(
    [
      currentTarget,
      tenantId,
      () => toValue(actorId),
      () => JSON.stringify(toValue(permissions) ?? []),
      () => JSON.stringify(toValue(roles) ?? []),
      () => toValue(routeName),
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
    delivery,
    deliveryPending,
    deliveryError,
    eligibility,
    loadLock,
    launch,
    close,
    submit,
    requestPasswordDelivery,
    invalidate,
  }
}
