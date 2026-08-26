import { describe, expect, it } from 'vitest'
import { createSafeErrorDiagnostic, sanitizeDiagnosticValue } from '@/services/api/errorDiagnostics'
import { mapPasswordDeliveryRequestResult } from '@/contracts/admin-system/account-lifecycle'
import { lifecycleError } from '../fixtures'

describe('account lifecycle diagnostics', () => {
  it('redacts sensitive diagnostic values', () => {
    expect(
      sanitizeDiagnosticValue({
        token: 'secret',
        password: 'secret',
        reason: 'private reason',
        tenantPrivate: 'tenant',
        roleIds: ['role'],
        permissionPayload: ['permissions'],
        requestId: 'safe',
      }),
    ).toEqual({
      token: '[redacted]',
      password: '[redacted]',
      reason: '[redacted]',
      tenantPrivate: '[redacted]',
      roleIds: '[redacted]',
      permissionPayload: '[redacted]',
      requestId: 'safe',
    })
  })

  it('keeps only safe error context', () => {
    expect(
      createSafeErrorDiagnostic(lifecycleError('validation_failed', 422), { operationId: 'op' }),
    ).toEqual({
      operationId: 'op',
      status: 422,
      code: 'validation_failed',
      requestId: 'req-test',
    })
  })

  it('projects password delivery results to status channel and requested time only', () => {
    expect(
      mapPasswordDeliveryRequestResult({
        status: 'requested',
        delivery_channel: 'email',
        delivery_requested_at: '2026-08-26T12:00:00Z',
        token: 'secret',
        password_url: 'https://private.test/token',
        email: 'private@example.test',
        provider_diagnostic: { id: 'private' },
      }),
    ).toEqual({
      status: 'requested',
      deliveryChannel: 'email',
      deliveryRequestedAt: '2026-08-26T12:00:00Z',
    })
  })
})
