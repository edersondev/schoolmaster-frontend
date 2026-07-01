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

  it('passes school-scoped service options to membership list and batch requests', async () => {
    const serviceOptions = vi.fn(() => ({ schoolId: 'school-1' }))
    const listLoader = vi.fn().mockResolvedValue({ items: [], meta: { page: 1, perPage: 25, total: 0 } })
    const addLoader = vi.fn().mockResolvedValue({ succeeded: true })
    const endLoader = vi.fn().mockResolvedValue({ succeeded: true })
    const memberships = useRosterMemberships({ serviceOptions, listLoader, addLoader, endLoader })

    await memberships.load('section-1', { academicPeriodId: 'period-1' })
    memberships.setStudentSelection(['student-1'])
    memberships.batch.academicPeriodId = 'period-1'
    memberships.batch.effectiveStartDate = '2026-01-01'
    await memberships.submitAdd('section-1')
    memberships.setMembershipSelection(['membership-1'])
    memberships.batch.effectiveEndDate = '2026-02-01'
    memberships.batch.reason = 'completed'
    await memberships.submitEnd('section-1')

    expect(listLoader).toHaveBeenCalledWith('section-1', { academicPeriodId: 'period-1' }, { schoolId: 'school-1' })
    expect(addLoader).toHaveBeenCalledWith('section-1', memberships.batch, { schoolId: 'school-1' })
    expect(endLoader).toHaveBeenCalledWith('section-1', memberships.batch, { schoolId: 'school-1' })
  })
})
