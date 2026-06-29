import { describe, expect, it } from 'vitest'
import { normalizeAdministrationError } from '@/services/admin-system/administration-error-mapper'

describe('administration lifecycle error mapper', () => {
  it('normalizes safe feedback without exposing submitted reason text', () => {
    const error = normalizeAdministrationError(
      {
        response: {
          status: 409,
          headers: { 'x-request-id': 'request-1' },
          data: {
            error: {
              code: 'dependency_conflict',
              details: { reason: 'sensitive reason', errors: { reason: ['Required'] } },
            },
          },
        },
      },
      { operationId: 'deactivateUser', routeName: 'userDetail' },
    )

    expect(error).toMatchObject({
      type: 'conflict',
      conflictKind: 'dependency',
      operationId: 'deactivateUser',
      requestId: 'request-1',
    })
    expect(JSON.stringify(error)).not.toContain('sensitive reason')
  })
})
