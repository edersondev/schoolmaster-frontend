import { describe, expect, it } from 'vitest'
import { AUTH_ROUTE_NAMES, authRoutes } from '@/router/modules/auth.routes'

describe('password reset routes', () => {
  it('registers request and completion flows', () => {
    const children = authRoutes[0].children
    expect(children.find((entry) => entry.name === AUTH_ROUTE_NAMES.forgotPassword).component).toBeTypeOf(
      'function',
    )
    expect(
      children.find((entry) => entry.name === AUTH_ROUTE_NAMES.passwordResetCompletion).meta,
    ).toMatchObject({ guestLifecycle: true })
  })
})

