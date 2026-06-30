import { describe, expect, it, vi } from 'vitest'
import { useRosterMemberships } from '@/composables/admin-system/useRosterMemberships'

describe('useRosterMemberships', () => {
  it('dedupes selections and enforces batch validation', async () => {
    const memberships = useRosterMemberships({ addLoader: vi.fn().mockResolvedValue({ succeeded: true }) })
    memberships.setStudentSelection(['s1', 's1'])
    expect(memberships.selectedStudentIds.value).toEqual(['s1'])
    expect(await memberships.submitAdd('section-1')).toBeNull()
    memberships.batch.academicPeriodId = 'p1'
    memberships.batch.effectiveStartDate = '2026-01-01'
    await memberships.submitAdd('section-1')
    expect(memberships.status.value).toBe('ready')
  })
})
