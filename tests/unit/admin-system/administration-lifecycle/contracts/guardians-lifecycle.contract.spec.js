import { describe, expect, it } from 'vitest'
import { mapGuardianUpdateRequest } from '@/contracts/admin-system/guardians'

describe('guardian lifecycle contract', () => {
  it('maps contact fields without user-link payloads', () => {
    expect(mapGuardianUpdateRequest({ fullName: 'Jordan', relationshipType: 'parent', userLinkId: 'blocked' })).toEqual({ full_name: 'Jordan', relationship_type: 'parent' })
  })
})
