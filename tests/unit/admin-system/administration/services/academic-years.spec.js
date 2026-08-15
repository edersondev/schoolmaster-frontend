import { describe, expect, it, vi } from 'vitest'
import { createAcademicYearsService } from '@/services/admin-system/academic-years'
import { createAdminClient } from '../administration.fixtures'

describe('academic years service', () => {
  it('submits documented list filter parameter names', async () => {
    const client = createAdminClient({
      get: vi.fn().mockResolvedValue({ data: { data: [], meta: {} } }),
    })

    await createAcademicYearsService(client).listAcademicYears({
      page: 2,
      perPage: 50,
      name: 'Primary',
      dateFrom: '2026-01-01',
      dateTo: '2026-12-31',
      status: 'closed',
    })

    expect(client.get.mock.calls[0][1].params).toEqual({
      page: 2,
      per_page: 50,
      name: 'Primary',
      date_from: '2026-01-01',
      date_to: '2026-12-31',
      status: 'closed',
    })
  })

  it('maps create dates', async () => {
    const client = createAdminClient({
      post: vi.fn().mockResolvedValue({ data: { data: { id: '1' } } }),
    })
    await createAcademicYearsService(client).createAcademicYear({
      name: '2026',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    })
    expect(client.post.mock.calls[0][1]).toEqual({
      name: '2026',
      start_date: '2026-01-01',
      end_date: '2026-12-31',
    })
  })
})
