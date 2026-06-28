import { describe, expect, it, vi } from 'vitest'
import { createAcademicYearsService } from '@/services/admin-system/academic-years'
import { createAcademicPeriodsService } from '@/services/admin-system/academic-periods'

describe('academics lifecycle service', () => {
  it('updates year and period payloads with tenant headers', async () => {
    const client = {
      get: vi.fn(() => ({ data: { data: { id: 'a1', name: '2026' } } })),
      patch: vi.fn(() => ({ data: { data: { id: 'a1', name: '2026' } } })),
    }
    await createAcademicYearsService(client).updateAcademicYear('y1', { name: '2026', startDate: '2026-01-01', endDate: '2026-12-31' }, { schoolId: 'school1' })
    await createAcademicPeriodsService(client).updateAcademicPeriod('p1', { academicYearId: 'blocked', name: 'T1', sequence: 1, startDate: '2026-01-01', endDate: '2026-06-30' }, { schoolId: 'school1' })
    expect(client.patch.mock.calls[0][1]).toEqual({ name: '2026', start_date: '2026-01-01', end_date: '2026-12-31' })
    expect(client.patch.mock.calls[1][1]).not.toHaveProperty('academic_year_id')
  })
})
