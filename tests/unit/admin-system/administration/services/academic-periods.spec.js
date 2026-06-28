import { describe, expect, it, vi } from 'vitest'
import { createAcademicPeriodsService } from '@/services/admin-system/academic-periods'
import { createAdminClient, paginatedEnvelope } from '../administration.fixtures'

describe('academic periods service', () => {
  it('sends academic-year filter', async () => {
    const client = createAdminClient({
      get: vi.fn().mockResolvedValue({ data: paginatedEnvelope }),
    })
    await createAcademicPeriodsService(client).listAcademicPeriods({
      page: 1,
      perPage: 25,
      academicYearId: 'year',
    })
    expect(client.get.mock.calls[0][1].params.academic_year_id).toBe('year')
  })
})
