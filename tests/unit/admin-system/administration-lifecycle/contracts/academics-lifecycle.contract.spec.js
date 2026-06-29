import { describe, expect, it } from 'vitest'
import { mapAcademicPeriodUpdateRequest, mapAcademicYearUpdateRequest } from '@/contracts/admin-system/academics'

describe('academic lifecycle contract', () => {
  it('maps year and period updates without period-year reassignment', () => {
    expect(mapAcademicYearUpdateRequest({ name: '2026', startDate: '2026-01-01', endDate: '2026-12-31' })).toEqual({ name: '2026', start_date: '2026-01-01', end_date: '2026-12-31' })
    expect(mapAcademicPeriodUpdateRequest({ academicYearId: 'blocked', name: 'Term', sequence: 1, startDate: '2026-01-01', endDate: '2026-06-30' })).toEqual({ name: 'Term', sequence: 1, start_date: '2026-01-01', end_date: '2026-06-30' })
  })
})
