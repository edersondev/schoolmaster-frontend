import { describe, expect, it } from 'vitest'
import { mapLifecycleOutcome } from '@/contracts/admin-system/lifecycle'

describe('single lifecycle outcomes', () => {
  it('maps status and lifecycle history without undocumented fields', () => {
    expect(mapLifecycleOutcome({ data: { resource_id: 'u1', status: 'inactive', lifecycle_history: [] } })).toEqual(expect.objectContaining({ resourceId: 'u1', status: 'inactive', lifecycleHistory: [] }))
  })
})
