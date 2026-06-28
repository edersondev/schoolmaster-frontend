import { describe, expect, it, vi } from 'vitest'
import { createAcademicYearsService } from '@/services/admin-system/academic-years'
import { createAcademicPeriodsService } from '@/services/admin-system/academic-periods'

describe('academic single lifecycle service', () => {
  it('supports year and period lifecycle operations', async () => {
    const client = { post: vi.fn(() => ({ data: { data: { status: 'active' } } })) }
    await createAcademicYearsService(client).activateAcademicYear('y1', { effectiveAt: '2026-06-28', reason: 'Audit' }, { schoolId: 'school1' })
    await createAcademicPeriodsService(client).restoreAcademicPeriod('p1', { effectiveAt: '2026-06-28', reason: 'Audit' }, { schoolId: 'school1' })
    expect(client.post).toHaveBeenCalledTimes(2)
  })
})
