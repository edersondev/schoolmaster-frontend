import { describe, expect, it } from 'vitest'
import { shallowRef } from 'vue'
import { deriveLifecycleActions, useAdminActionEligibility } from '@/composables/admin-system/useAdminActionEligibility'

describe('useAdminActionEligibility', () => {
  it('derives actions from status, permissions, and resource capability', () => {
    expect(
      deriveLifecycleActions({
        resource: 'schools',
        status: 'active',
        permissions: ['schools.view', 'schools.manage'],
      }),
    ).toEqual(['deactivate', 'delete'])
    expect(deriveLifecycleActions({ resource: 'permissions', status: 'active' })).toEqual([])
  })

  it('reacts to permission and tenant context changes', () => {
    const status = shallowRef('deleted')
    const permissions = shallowRef(['users.view', 'users.manage'])
    const schoolReady = shallowRef(true)
    const eligibility = useAdminActionEligibility({
      resource: 'users',
      status,
      permissions,
      schoolReady,
    })
    expect(eligibility.actions.value).toEqual(['restore'])
    schoolReady.value = false
    expect(eligibility.actions.value).toEqual([])
  })
})
