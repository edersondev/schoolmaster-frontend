import { describe, expect, it } from 'vitest'
import { deriveLifecycleActions } from '@/composables/admin-system/useAdminActionEligibility'

describe('list row lifecycle actions', () => {
  it('shows eligible actions and hides permission lifecycle actions', () => {
    expect(deriveLifecycleActions({ resource: 'users', status: 'active', permissions: ['users.view', 'users.manage'], schoolReady: true })).toEqual(['deactivate', 'delete'])
    expect(deriveLifecycleActions({ resource: 'permissions', status: 'active', permissions: ['permissions.view'], schoolReady: true })).toEqual([])
  })
})
