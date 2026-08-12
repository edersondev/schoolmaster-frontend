import { computed, onScopeDispose, shallowRef, toValue, watch } from 'vue'
import { deriveAccountLifecycleEligibility } from '@/contracts/admin-system/account-lifecycle'
import { adminAccountLifecycleService } from '@/services/admin-system/accountLifecycle'

export function useAccountInvitation({
  target,
  schoolId = null,
  actorId = null,
  permissions = [],
  roles = [],
  service = adminAccountLifecycleService,
} = {}) {
  const pending = shallowRef(false)
  const invitation = shallowRef(null)
  const error = shallowRef(null)
  let generation = 0
  let controller = null
  let pendingRequest = null

  const currentTarget = computed(() => toValue(target))
  const eligibility = computed(() =>
    deriveAccountLifecycleEligibility({
      actorId: toValue(actorId),
      target: currentTarget.value,
      schoolId: toValue(schoolId),
      permissions: toValue(permissions) ?? [],
      roles: toValue(roles) ?? [],
    }),
  )
  const canCreate = computed(() => eligibility.value.canInvite && !pending.value)

  async function create() {
    if (pendingRequest) return pendingRequest
    const user = currentTarget.value
    if (!user || !canCreate.value) return null

    const currentGeneration = generation
    controller?.abort()
    controller = new AbortController()
    const requestController = controller
    pendingRequest = (async () => {
      pending.value = true
      error.value = null
      try {
        const result = await service.createAccountInvitation(
          {
            scope: (user.schoolId ?? user.school_id) ? 'school' : 'platform',
            schoolId: user.schoolId ?? user.school_id ?? null,
            fullName: user.fullName ?? user.full_name,
            email: user.email,
            roleIds: (user.roles ?? []).map((role) => role.id).filter(Boolean),
          },
          {
            schoolId: toValue(schoolId) ?? undefined,
            signal: requestController.signal,
          },
        )
        if (currentGeneration !== generation || requestController.signal.aborted) return null
        invitation.value = result
        return result
      } catch (cause) {
        if (currentGeneration !== generation || requestController.signal.aborted) return null
        error.value = cause
        throw cause
      } finally {
        if (currentGeneration === generation) pending.value = false
      }
    })()

    try {
      return await pendingRequest
    } finally {
      pendingRequest = null
    }
  }

  function invalidate() {
    generation += 1
    controller?.abort()
    pending.value = false
    invitation.value = null
    error.value = null
  }

  watch(
    [
      () => currentTarget.value?.id,
      () => toValue(schoolId),
      () => toValue(actorId),
      () => JSON.stringify(toValue(permissions) ?? []),
      () => JSON.stringify(toValue(roles) ?? []),
    ],
    invalidate,
  )
  onScopeDispose(invalidate)

  return { pending, invitation, error, eligibility, canCreate, create, invalidate }
}
