import { describe, expect, it, vi } from 'vitest'
import { createUsersService } from '@/services/admin-system/users'

describe('user single lifecycle service', () => {
  it('sends tenant-scoped lifecycle requests', async () => {
    const client = { post: vi.fn(() => ({ data: { data: { resource_id: 'u1' } } })), delete: vi.fn(() => ({ data: { data: { resource_id: 'u1' } } })) }
    await createUsersService(client, () => 'token').deactivateUser('u1', { effectiveAt: '2026-06-28', reason: 'Audit' }, { schoolId: 'school1' })
    expect(client.post.mock.calls[0][2].headers['X-School-Id']).toBe('school1')
  })
})
