import { computed, shallowRef, toValue, watch } from 'vue'
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
  permissions = [],
  capabilities = [],
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
  let requestId = 0

  const currentTarget = computed(() => toValue(target))
  const tenantId = computed(() => toValue(schoolId))
  const eligibility = computed(() =>
    deriveAccountLifecycleEligibility({
      target: currentTarget.value,
      lock: lock.value,
      permissions: toValue(permissions) ?? [],
      capabilities: toValue(capabilities) ?? [],
      schoolReady: Boolean(tenantId.value),
    }),
  )

  async function loadLock() {
    const user = currentTarget.value
    if (!user || eligibility.value.blocked) return null
    const currentRequest = requestId + 1
    requestId = currentRequest
    loading.value = true
    error.value = null
    try {
      const response = await service.getAccountLock(user.id, { schoolId: tenantId.value })
      if (currentRequest !== requestId) return null
      lock.value = response
      return response
    } catch (loadError) {
      if (currentRequest !== requestId) return null
      error.value = loadError
      throw loadError
    } finally {
      if (currentRequest === requestId) loading.value = false
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
    const user = currentTarget.value
    if (!user || eligibility.value.blocked || !action.value) return null
    fieldErrors.value = validateAccountLifecycleAction({
      action: action.value,
      reason: reason.value,
    })
    if (Object.keys(fieldErrors.value).length > 0) return null

    pending.value = true
    error.value = null
    try {
      let response
      if (action.value === ACCOUNT_LIFECYCLE_ACTIONS.lock) {
        response = await service.lockAccount(user.id, { reason: reason.value }, { schoolId: tenantId.value })
        lock.value = response
      } else if (action.value === ACCOUNT_LIFECYCLE_ACTIONS.unlock) {
        response = await service.unlockAccount(user.id, { schoolId: tenantId.value })
        lock.value = { ...lock.value, status: 'cleared' }
      } else {
        response = await service.reactivateAccount(
          user.id,
          { action: action.value, reason: reason.value },
          { schoolId: tenantId.value },
        )
      }
      ElMessage.success(t('administration.common.updateSuccess'))
      close()
      await loadLock()
      return response
    } catch (submitError) {
      fieldErrors.value = submitError.fieldErrors ?? {}
      error.value = submitError
      throw submitError
    } finally {
      pending.value = false
    }
  }

  watch([currentTarget, tenantId], () => loadLock(), { immediate: true })

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
  }
}

