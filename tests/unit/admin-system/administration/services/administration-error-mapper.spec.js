import { describe, expect, it } from 'vitest'
import { normalizeAdministrationError } from '@/services/admin-system/administration-error-mapper'
import { validationError } from '../administration.fixtures'

describe('administration error mapper', () => {
  it('maps validation safely with request id and no raw payload', () => {
    expect(normalizeAdministrationError(validationError, { operationId: 'createSchool' })).toEqual(
      expect.objectContaining({
        type: 'validation',
        operationId: 'createSchool',
        requestId: 'req-test',
        fieldErrors: { name: ['Name is required.'] },
      }),
    )
  })

  it('maps backend validation fields into field errors', () => {
    expect(
      normalizeAdministrationError({
        response: {
          status: 422,
          data: {
            error: {
              code: 'validation_failed',
              details: { fields: { cnpj: ['The cnpj has already been taken.'] } },
            },
          },
        },
      }),
    ).toEqual(
      expect.objectContaining({
        type: 'validation',
        fieldErrors: { cnpj: ['The cnpj has already been taken.'] },
      }),
    )
  })

  it.each([
    [401, 'token_expired', 'unauthorized'],
    [403, 'forbidden', 'forbidden'],
    [409, 'conflict', 'conflict'],
    [403, 'tenant_mismatch', 'tenant-mismatch'],
    [404, 'not_found', 'not-found'],
    [503, 'unavailable', 'unavailable'],
  ])('maps %s/%s', (status, code, type) => {
    expect(
      normalizeAdministrationError({
        response: { status, data: { error: { code, message: 'unsafe' } } },
      }).type,
    ).toBe(type)
  })

  it('provides explicit sign-in recovery for expired sessions', () => {
    expect(
      normalizeAdministrationError({
        response: { status: 401, data: { error: { code: 'token_expired' } } },
      }),
    ).toEqual(
      expect.objectContaining({
        type: 'unauthorized',
        messageKey: 'common.sessionExpired',
        recoveryAction: 'sign-in',
      }),
    )
  })
})
