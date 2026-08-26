import { computed, shallowRef } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useUserCreationRecovery } from '@/composables/admin-system/useUserCreationRecovery'
import { normalizeAdministrationError } from '@/services/admin-system/administration-error-mapper'
import {
  deferred,
  recoverableConflict,
  recoverySchoolId,
  recoveryUserId,
  restoreFailure,
  restoreFailureStatuses,
} from '../fixtures/recoveryFeedback'

function createSubject({ restoreUser = vi.fn(), onRestored = vi.fn() } = {}) {
  const email = shallowRef('joao@test.com.br')
  const schoolId = shallowRef(recoverySchoolId)
  const actorId = shallowRef('admin-1')
  const authorizationGeneration = shallowRef(1)
  const routeName = shallowRef('userCreate')
  const recovery = useUserCreationRecovery({
    email,
    schoolId,
    actorId,
    authorizationGeneration,
    routeName,
    restoreUser,
    onRestored,
    now: () => new Date('2026-08-23T12:00:00'),
  })
  const feedback = normalizeAdministrationError(recoverableConflict(), {
    operationId: 'createUser',
    routeName: 'userCreate',
  })
  recovery.accept(feedback)
  recovery.open()
  recovery.dialogValues.effectiveAt = '2026-08-23'
  recovery.dialogValues.reason = 'Approved identity recovery'

  return { recovery, email, schoolId, actorId, authorizationGeneration, routeName }
}

describe('useUserCreationRecovery restore orchestration', () => {
  it('submits one restore in the original school and completes current success once', async () => {
    const request = deferred()
    const restoreUser = vi.fn(() => request.promise)
    const onRestored = vi.fn()
    const { recovery } = createSubject({ restoreUser, onRestored })

    const first = recovery.submit()
    const duplicate = recovery.submit()
    expect(restoreUser).toHaveBeenCalledTimes(1)
    expect(restoreUser).toHaveBeenCalledWith(
      recoveryUserId,
      { effectiveAt: '2026-08-23', reason: 'Approved identity recovery' },
      { schoolId: recoverySchoolId },
    )

    request.resolve({ status: 'active' })
    await expect(first).resolves.toEqual({ status: 'active' })
    await expect(duplicate).resolves.toBeNull()
    expect(onRestored).toHaveBeenCalledWith({
      userId: recoveryUserId,
      schoolId: recoverySchoolId,
      result: { status: 'active' },
    })
    expect(recovery.visible.value).toBe(false)
    expect(recovery.dialogOpen.value).toBe(false)
  })

  it('preserves the target and confirmation for local validation', async () => {
    const restoreUser = vi.fn()
    const { recovery } = createSubject({ restoreUser })
    recovery.dialogValues.reason = ''

    await expect(recovery.submit()).rejects.toMatchObject({ type: 'validation' })
    expect(restoreUser).not.toHaveBeenCalled()
    expect(recovery.visible.value).toBe(true)
    expect(recovery.dialogOpen.value).toBe(true)
  })

  it.each(restoreFailureStatuses.preserve)(
    'preserves confirmation for retryable status %s',
    async (status) => {
      const restoreUser = vi
        .fn()
        .mockRejectedValue(
          restoreFailure(status, status === 422 ? 'validation_failed' : 'service_unavailable'),
        )
      const { recovery } = createSubject({ restoreUser })

      await expect(recovery.submit()).rejects.toMatchObject({ status })
      expect(recovery.visible.value).toBe(true)
      expect(recovery.dialogOpen.value).toBe(true)
      expect(recovery.dialogValues.reason).toBe('Approved identity recovery')
      expect(recovery.feedback.value).toBeNull()
    },
  )

  it.each(restoreFailureStatuses.clear)(
    'clears recovery with safe terminal feedback for status %s',
    async (status) => {
      const code =
        { 401: 'unauthenticated', 403: 'forbidden', 404: 'not_found', 409: 'conflict' }[status] ??
        'unknown'
      const restoreUser = vi.fn().mockRejectedValue(restoreFailure(status, code))
      const { recovery } = createSubject({ restoreUser })

      await expect(recovery.submit()).rejects.toMatchObject({ status })
      expect(recovery.visible.value).toBe(false)
      expect(recovery.dialogOpen.value).toBe(false)
      expect(recovery.feedback.value).toEqual(
        expect.objectContaining({ status, operationId: 'restoreUser' }),
      )
      expect(recovery.feedback.value).not.toHaveProperty('recoveryUserId')
      recovery.cancel()
      expect(recovery.feedback.value).toEqual(
        expect.objectContaining({ status, operationId: 'restoreUser' }),
      )
    },
  )
})

describe('useUserCreationRecovery invalidation', () => {
  it.each([
    ['email', ({ email }) => (email.value = 'edited@test.com.br')],
    ['school', ({ schoolId }) => (schoolId.value = 'school-2')],
    ['actor', ({ actorId }) => (actorId.value = 'admin-2')],
    [
      'session or permission generation',
      ({ authorizationGeneration }) => (authorizationGeneration.value = 2),
    ],
    ['route', ({ routeName }) => (routeName.value = 'usersList')],
  ])('clears recovery after a %s change', (_label, mutate) => {
    const subject = createSubject()
    mutate(subject)

    expect(subject.recovery.invalidateIfContextChanged()).toBe(true)
    expect(subject.recovery.visible.value).toBe(false)
    expect(subject.recovery.dialogOpen.value).toBe(false)
  })

  it('clears the recovery target when confirmation is cancelled', () => {
    const { recovery } = createSubject()

    recovery.cancel()

    expect(recovery.visible.value).toBe(false)
    expect(recovery.dialogOpen.value).toBe(false)
    expect(recovery.open()).toBe(false)
  })

  it('makes an in-flight restore inert after context invalidation', async () => {
    const request = deferred()
    const onRestored = vi.fn()
    const subject = createSubject({ restoreUser: vi.fn(() => request.promise), onRestored })
    const submission = subject.recovery.submit()
    subject.schoolId.value = 'school-2'
    subject.recovery.invalidateIfContextChanged()

    request.resolve({ status: 'active' })

    await expect(submission).resolves.toBeNull()
    expect(onRestored).not.toHaveBeenCalled()
    expect(subject.recovery.visible.value).toBe(false)
  })

  it('lets a newer accepted create result invalidate an older restore result', async () => {
    const request = deferred()
    const onRestored = vi.fn()
    const subject = createSubject({ restoreUser: vi.fn(() => request.promise), onRestored })
    const staleSubmission = subject.recovery.submit()
    const nextFeedback = normalizeAdministrationError(
      recoverableConflict({ details: { user_id: '9d879a07-f4a0-4a56-a634-f4b22a5d056b' } }),
      { operationId: 'createUser', routeName: 'userCreate' },
    )

    subject.recovery.accept(nextFeedback)
    request.resolve({ status: 'active' })

    await expect(staleSubmission).resolves.toBeNull()
    expect(onRestored).not.toHaveBeenCalled()
    expect(subject.recovery.visible.value).toBe(true)
  })
})
