export const recoveryUserId = 'f34c45fe-7ee1-4bec-99b1-26cc2cad0456'
export const recoverySchoolId = '20000000-0000-4000-8000-000000000001'

export function recoverableConflict(overrides = {}) {
  const details = {
    user_id: recoveryUserId,
    recommended_action: 'restore',
    hidden_profile: { full_name: 'Must not be projected' },
    ...overrides.details,
  }

  return {
    response: {
      status: overrides.status ?? 409,
      headers: { 'x-request-id': 'req-recovery' },
      data: {
        error: {
          code: overrides.code ?? 'recoverable_user_conflict',
          message: overrides.message ?? 'Unsafe backend recovery message',
          details,
          ...overrides.error,
        },
      },
    },
  }
}

export function genericDuplicateConflict() {
  return {
    response: {
      status: 422,
      data: {
        error: {
          code: 'validation_failed',
          message: 'The given data was invalid.',
          details: { fields: { email: ['This email is unavailable.'] } },
        },
      },
    },
  }
}

export const malformedRecoveryConflicts = Object.freeze([
  recoverableConflict({ details: { user_id: 'not-a-uuid' } }),
  recoverableConflict({ details: { user_id: null } }),
  recoverableConflict({ details: { recommended_action: 'activate' } }),
  recoverableConflict({ status: 422 }),
  recoverableConflict({ code: 'RECOVERABLE_USER_CONFLICT' }),
  {
    response: {
      status: 409,
      data: {
        code: 'recoverable_user_conflict',
        details: { user_id: recoveryUserId, recommended_action: 'restore' },
      },
    },
  },
])

export const restoreFailureStatuses = Object.freeze({
  preserve: [0, 408, 422, 429, 500, 503],
  clear: [400, 401, 403, 404, 409, 418],
})

export function restoreFailure(status, code = 'unknown') {
  if (status === 0) return new Error('Network unavailable')

  return {
    response: {
      status,
      data: { error: { code, message: 'Unsafe restore failure message' } },
    },
  }
}

export function deferred() {
  let resolve
  let reject
  const promise = new Promise((nextResolve, nextReject) => {
    resolve = nextResolve
    reject = nextReject
  })

  return { promise, resolve, reject }
}
