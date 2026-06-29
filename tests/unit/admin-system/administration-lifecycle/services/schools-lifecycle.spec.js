import { describe, expect, it, vi } from 'vitest'
import { createSchoolsService } from '@/services/admin-system/schools'

describe('schools lifecycle service', () => {
  it('gets and updates schools through approved endpoints without status payload', async () => {
    const client = {
      get: vi.fn(() => ({ data: { data: { id: 's1', name: 'North' } } })),
      patch: vi.fn(() => ({ data: { data: { id: 's1', name: 'North' } } })),
    }
    const service = createSchoolsService(client, () => 'token')
    await service.getSchool('s1')
    await service.updateSchool('s1', { name: 'North', status: 'inactive' })
    expect(client.get).toHaveBeenCalledWith('/api/v1/schools/s1', expect.any(Object))
    expect(client.patch).toHaveBeenCalledWith('/api/v1/schools/s1', { name: 'North' }, expect.any(Object))
  })
})
