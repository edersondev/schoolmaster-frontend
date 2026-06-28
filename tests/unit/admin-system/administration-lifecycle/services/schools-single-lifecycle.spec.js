import { describe, expect, it, vi } from 'vitest'
import { createSchoolsService } from '@/services/admin-system/schools'

describe('school single lifecycle service', () => {
  it('maps activate, deactivate, delete, and restore outcomes', async () => {
    const client = {
      post: vi.fn(() => ({ data: { data: { resource_id: 's1', status: 'active' } } })),
      delete: vi.fn(() => ({ data: { data: { resource_id: 's1', status: 'deleted' } } })),
    }
    const service = createSchoolsService(client, () => 'token')
    await service.activateSchool('s1', { effectiveAt: '2026-06-28', reason: 'Audit' })
    await service.deactivateSchool('s1', { effectiveAt: '2026-06-28', reason: 'Audit' })
    await service.deleteSchool('s1', { effectiveAt: '2026-06-28', reason: 'Audit' })
    await service.restoreSchool('s1', { effectiveAt: '2026-06-28', reason: 'Audit' })
    expect(client.post).toHaveBeenCalledWith('/api/v1/schools/s1/activate', expect.objectContaining({ reason: 'Audit' }), expect.any(Object))
    expect(client.delete).toHaveBeenCalledWith('/api/v1/schools/s1', expect.objectContaining({ data: expect.objectContaining({ reason: 'Audit' }) }))
  })
})
