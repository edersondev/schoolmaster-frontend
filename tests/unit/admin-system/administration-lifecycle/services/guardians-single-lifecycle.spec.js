import { describe, expect, it, vi } from 'vitest'
import { createGuardiansService } from '@/services/admin-system/guardians'

describe('guardian single lifecycle service', () => {
  it('sends guardian lifecycle requests with tenant headers', async () => {
    const client = { post: vi.fn(() => ({ data: { data: { resource_id: 'g1' } } })) }
    await createGuardiansService(client).activateGuardian('g1', { effectiveAt: '2026-06-28', reason: 'Audit' }, { schoolId: 'school1' })
    expect(client.post.mock.calls[0][2].headers['X-School-Id']).toBe('school1')
  })
})
