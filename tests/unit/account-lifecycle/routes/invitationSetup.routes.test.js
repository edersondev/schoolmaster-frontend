import { describe, expect, it } from 'vitest'
import { AUTH_ROUTE_NAMES, authRoutes } from '@/router/modules/auth.routes'

describe('invitation setup route', () => {
  it('registers guest lifecycle metadata', () => {
    const route = authRoutes[0].children.find(
      (entry) => entry.name === AUTH_ROUTE_NAMES.invitationSetup,
    )

    expect(route.path).toBe('account-invitations/:invitationToken/setup')
    expect(route.meta).toMatchObject({ guestLifecycle: true, layout: 'auth' })
  })
})

