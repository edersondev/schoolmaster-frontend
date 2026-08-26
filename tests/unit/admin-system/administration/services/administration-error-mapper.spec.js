import { describe, expect, it } from 'vitest'
import { normalizeAdministrationError } from '@/services/admin-system/administration-error-mapper'
import { validationError } from '../administration.fixtures'
import {
  genericDuplicateConflict,
  malformedRecoveryConflicts,
  recoverableConflict,
  recoveryUserId,
} from '../../user-recovery/fixtures/recoveryFeedback'

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

  it('projects only an exact valid recoverable conflict into safe recovery state', () => {
    const feedback = normalizeAdministrationError(recoverableConflict(), {
      operationId: 'createUser',
      routeName: 'userCreate',
    })

    expect(feedback).toEqual({
      type: 'conflict',
      code: 'recoverable_user_conflict',
      status: 409,
      messageKey: 'administration.users.recovery.warning',
      recoveryAction: 'restore-user',
      recoveryUserId,
      fieldErrors: {},
      conflictKind: null,
      operationId: 'createUser',
      routeName: 'userCreate',
      requestId: 'req-recovery',
    })
    expect(feedback).not.toHaveProperty('message')
    expect(feedback).not.toHaveProperty('details')
    expect(JSON.stringify(feedback)).not.toContain('Must not be projected')
    expect(JSON.stringify(feedback)).not.toContain('Unsafe backend recovery message')
  })

  it('keeps generic unavailable-email validation non-recoverable', () => {
    const feedback = normalizeAdministrationError(genericDuplicateConflict(), {
      operationId: 'createUser',
    })

    expect(feedback).toMatchObject({
      type: 'validation',
      fieldErrors: { email: ['This email is unavailable.'] },
    })
    expect(feedback).not.toHaveProperty('recoveryAction')
    expect(feedback).not.toHaveProperty('recoveryUserId')
  })

  it.each(malformedRecoveryConflicts)(
    'fails malformed, flat, or unsupported recovery payloads closed',
    (cause) => {
      const feedback = normalizeAdministrationError(cause, { operationId: 'createUser' })

      expect(feedback.messageKey).toBe('common.conflict')
      expect(feedback).not.toHaveProperty('recoveryAction')
      expect(feedback).not.toHaveProperty('recoveryUserId')
      expect(JSON.stringify(feedback)).not.toContain(recoveryUserId)
    },
  )

  it('ignores unexpected exact-response fields without projecting them', () => {
    const feedback = normalizeAdministrationError(
      recoverableConflict({
        error: { audit: { deletedBy: 'hidden-admin' } },
        details: { tenant_id: 'hidden-tenant', deletion_reason: 'hidden-reason' },
      }),
      { operationId: 'createUser' },
    )

    expect(feedback.recoveryUserId).toBe(recoveryUserId)
    expect(JSON.stringify(feedback)).not.toContain('hidden-admin')
    expect(JSON.stringify(feedback)).not.toContain('hidden-tenant')
    expect(JSON.stringify(feedback)).not.toContain('hidden-reason')
  })
})
