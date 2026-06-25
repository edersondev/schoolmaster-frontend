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

  it.each([
    [401, 'token_expired', 'unauthorized'],
    [403, 'forbidden', 'forbidden'],
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
})
