import { describe, expect, it } from 'vitest'
import {
  createAcademicPeriodForm,
  mapAcademicPeriodCreateRequest,
  mapAcademicYearCreateRequest,
} from '@/contracts/admin-system/academics'

describe('academic contracts', () => {
  it('maps dates, parent year, and numeric sequence', () => {
    expect(
      mapAcademicYearCreateRequest({
        name: '2026',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      }),
    ).toEqual({
      name: '2026',
      start_date: '2026-01-01',
      end_date: '2026-12-31',
    })
    expect(
      mapAcademicPeriodCreateRequest({ ...createAcademicPeriodForm(), sequence: '2' }).sequence,
    ).toBe(2)
  })
})
