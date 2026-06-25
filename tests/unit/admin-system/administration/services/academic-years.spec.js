import { describe, expect, it, vi } from 'vitest'
import { createAcademicYearsService } from '@/services/admin-system/academic-years'
import { createAdminClient } from '../administration.fixtures'

describe('academic years service', () => {
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
