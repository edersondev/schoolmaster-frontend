import { describe, expect, it } from 'vitest'
import {
  getLifecycleCapability,
  getLifecycleOperations,
  mapBulkLifecycleRequest,
  projectUpdatePayload,
  validateLifecycleActionForm,
} from '@/contracts/admin-system/lifecycle'

describe('lifecycle contract', () => {
  it('defines capabilities, operations, update allowlists, and blocked bulk resources', () => {
    expect(getLifecycleOperations('users').bulk).toBe('bulkLifecycleUsers')
    expect(getLifecycleOperations('schools').bulk).toBeUndefined()
    expect(getLifecycleCapability('permissions').actions).toEqual([])
    expect(getLifecycleCapability('schools').bulk).toBe(false)
    expect(projectUpdatePayload({ name: 'A', status: 'inactive' }, 'schools')).toEqual({
      name: 'A',
    })
  })

  it('maps and validates audited lifecycle requests', () => {
    expect(
      mapBulkLifecycleRequest({
        action: 'deactivate',
        ids: ['1', '1', '2'],
        effectiveAt: '2026-06-28',
        reason: 'Audit',
      }),
    ).toEqual({
      action: 'deactivate',
      ids: ['1', '2'],
      effective_at: '2026-06-28',
      reason: 'Audit',
    })
    expect(
      validateLifecycleActionForm(
        { effectiveAt: '2026-06-29', reason: '' },
        new Date('2026-06-28T12:00:00'),
      ),
    ).toMatchObject({ effective_at: expect.any(Array), reason: expect.any(Array) })
  })
})
