import { describe, expect, it } from 'vitest'
import {
  mapAccountLifecycleActionRequest,
  validateAccountLifecycleAction,
} from '@/contracts/admin-system/account-lifecycle'

describe('account lifecycle action requests', () => {
  it('maps reason rules for lock unlock recovery and reactivation', () => {
    expect(validateAccountLifecycleAction({ action: 'lock', reason: '' })).toHaveProperty('reason')
    expect(mapAccountLifecycleActionRequest({ action: 'lock', reason: 'Admin support' })).toEqual({
      reason: 'Admin support',
    })
    expect(mapAccountLifecycleActionRequest({ action: 'unlock' })).toBeUndefined()
    expect(mapAccountLifecycleActionRequest({ action: 'recover' })).toEqual({ action: 'unlock' })
    expect(mapAccountLifecycleActionRequest({ action: 'reactivate', reason: 'Cleared' })).toEqual({
      action: 'reactivate',
      reason: 'Cleared',
    })
  })
})

