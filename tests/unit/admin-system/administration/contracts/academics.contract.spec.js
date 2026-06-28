import { describe, expect, it } from 'vitest'
import {
  createAcademicPeriodForm,
  createAcademicYearForm,
  mapAcademicPeriodCreateRequest,
  mapAcademicYearCreateRequest,
  validateAcademicPeriodForm,
  validateAcademicYearForm,
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

  it('validates required academic fields and ordered date ranges', () => {
    expect(validateAcademicYearForm(createAcademicYearForm())).toEqual({
      name: ['Academic year name is required.'],
      start_date: ['Start date is required.'],
      end_date: ['End date is required.'],
    })
    expect(
      validateAcademicYearForm({
        name: '2026',
        startDate: '2026-12-31',
        endDate: '2026-01-01',
      }),
    ).toEqual({
      end_date: ['End date cannot be earlier than start date.'],
    })
    expect(validateAcademicPeriodForm(createAcademicPeriodForm())).toEqual({
      academic_year_id: ['Academic year is required.'],
      name: ['Academic period name is required.'],
      start_date: ['Start date is required.'],
      end_date: ['End date is required.'],
    })
    expect(
      validateAcademicPeriodForm({
        ...createAcademicPeriodForm(),
        academicYearId: 'year-1',
        name: 'Term 1',
        sequence: 0,
        startDate: '2026-12-31',
        endDate: '2026-01-01',
      }),
    ).toEqual({
      sequence: ['Sequence must be a whole number greater than zero.'],
      end_date: ['End date cannot be earlier than start date.'],
    })
  })
})
