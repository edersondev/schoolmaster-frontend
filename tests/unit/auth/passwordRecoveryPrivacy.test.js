import { describe, expect, it, vi } from 'vitest'
import { createAuthService } from '@/services/auth/authService'
import { createAuthClient } from './auth.fixtures'

describe('password recovery privacy', () => {
  it.each(['missing', 'inactive', 'locked', 'deleted', 'over-limit'])(
    'returns the same accepted result for %s accounts',
    async () => {
      const service = createAuthService(
        createAuthClient({
          post: vi.fn().mockResolvedValue({ data: { accepted: true }, meta: {} }),
        }),
      )
      await expect(service.requestPasswordReset({ email: 'person@example.com' })).resolves.toEqual({
        accepted: true,
      })
    },
  )
})
