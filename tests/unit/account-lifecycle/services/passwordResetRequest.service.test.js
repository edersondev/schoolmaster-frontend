import { describe, expect, it } from 'vitest'
import { mapPasswordResetRequest } from '@/contracts/auth/account-lifecycle'

describe('password reset request service mapping', () => {
  it('submits email only', () => {
    expect(
      mapPasswordResetRequest({
        email: ' avery@example.com ',
        school_id: 'blocked',
        schoolId: 'blocked',
        delivery_metadata: { blocked: true },
      }),
    ).toEqual({ email: 'avery@example.com' })
  })
})

