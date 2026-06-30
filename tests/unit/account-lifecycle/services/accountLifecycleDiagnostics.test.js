import { describe, expect, it } from 'vitest'
import { createSafeErrorDiagnostic, sanitizeDiagnosticValue } from '@/services/api/errorDiagnostics'
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
    expect(createSafeErrorDiagnostic(lifecycleError('validation_failed', 422), { operationId: 'op' })).toEqual({
      operationId: 'op',
      status: 422,
      code: 'validation_failed',
      requestId: 'req-test',
    })
  })
})

