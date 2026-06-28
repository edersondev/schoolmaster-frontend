import { describe, expect, it } from 'vitest'
import { shallowRef } from 'vue'
import {
  deriveBulkLifecycleActions,
  deriveLifecycleActions,
  useAdminActionEligibility,
} from '@/composables/admin-system/useAdminActionEligibility'

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

  it('derives bulk actions from the intersection of all selected row actions', () => {
    expect(
      deriveBulkLifecycleActions({
        resource: 'users',
        selectedSummaries: [
          { id: 'u1', status: 'active' },
          { id: 'u2', status: 'inactive' },
        ],
        permissions: ['users.view', 'users.manage'],
        schoolReady: true,
      }),
    ).toEqual(['delete'])
  })

  it('omits bulk actions when selected rows have no common lifecycle action', () => {
    expect(
      deriveBulkLifecycleActions({
        resource: 'users',
        selectedSummaries: [
          { id: 'u1', status: 'active' },
          { id: 'u2', status: 'deleted' },
        ],
        permissions: ['users.view', 'users.manage'],
        schoolReady: true,
      }),
    ).toEqual([])
  })

  it('requires permissions and tenant context for bulk actions', () => {
    const selectedSummaries = [{ id: 'u1', status: 'active' }]

    expect(
      deriveBulkLifecycleActions({
        resource: 'users',
        selectedSummaries,
        permissions: ['users.view'],
        schoolReady: true,
      }),
    ).toEqual([])

    expect(
      deriveBulkLifecycleActions({
        resource: 'users',
        selectedSummaries,
        permissions: ['users.view', 'users.manage'],
        schoolReady: false,
      }),
    ).toEqual([])
  })
})
