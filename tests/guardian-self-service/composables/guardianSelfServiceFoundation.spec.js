import { describe, expect, it } from 'vitest'
import { mapAuthSession } from '@/contracts/auth/authSession.contract'
import { assertGuardianCapabilitySupported } from '@/contracts/guardian/guardianSelfServiceContract'
import { createGuardianWorkspaceContextState } from '@/composables/guardian/useGuardianWorkspaceContext'
import { useGuardianSelfServiceStaleGuard } from '@/composables/guardian/useGuardianSelfServiceStaleGuard'
import { redactGuardianSelfServiceValue } from '@/services/guardian/guardianSelfServiceDiagnostics'
import { normalizeGuardianSelfServiceError } from '@/services/guardian/guardianSelfServiceFeedbackMapper'

describe('guardian self-service foundation', () => {
  it('gates active school and safe no-guardian-link without inferring generic denial', () => {
    expect(createGuardianWorkspaceContextState({}).feedbackState.value.type).toBe('no-active-school')
    expect(
      createGuardianWorkspaceContextState({
        activeSchool: { id: 'school-1' },
        guardianAccessState: 'no-guardian-link',
      }).feedbackState.value.type,
    ).toBe('no-guardian-link')

    const generic = normalizeGuardianSelfServiceError({ response: { status: 403, data: {} } })
    expect(generic.type).toBe('forbidden')
  })

  it('preserves auth guardian self-service access aliases for workspace gates', () => {
    const session = mapAuthSession({
      token: 'token',
      token_expires_at: '2026-12-31T23:59:59Z',
      user: {
        id: 'guardian-1',
        full_name: 'Guardian User',
        email: 'guardian@example.test',
        status: 'active',
        guardian_self_service_access: 'no-guardian-link',
      },
      roles: [{ id: 'role-1', name: 'Guardian', scope: 'school', status: 'active' }],
      permissions: [],
      resolved_school: { id: 'school-1', name: 'North Campus', code: 'NC', status: 'active' },
    })

    expect(session.currentUser.guardianAccessState).toBe('no-guardian-link')
    expect(createGuardianWorkspaceContextState(session).feedbackState.value.type).toBe(
      'no-guardian-link',
    )
  })

  it('maps feedback states and redacts sensitive diagnostics', () => {
    expect(
      normalizeGuardianSelfServiceError({
        response: { status: 422, data: { error: { code: 'UNSUPPORTED_PAGE_SIZE' } } },
      }).type,
    ).toBe('unsupported-page-size')

    const redacted = redactGuardianSelfServiceValue({
      operationId: 'listGuardianStudents',
      studentProfileId: 'student-secret',
      token: 'secret',
      routeName: 'guardianLinkedStudents',
    })
    expect(redacted.operationId).toBe('listGuardianStudents')
    expect(redacted.studentProfileId).toBe('[redacted]')
    expect(redacted.token).toBe('[redacted]')
  })

  it('guards stale responses and blocked capabilities', () => {
    const guard = useGuardianSelfServiceStaleGuard()
    const captured = guard.capture(['school-1', 'student-1'])
    expect(guard.isCurrent(captured, ['school-1', 'student-1'])).toBe(true)
    guard.invalidate()
    expect(guard.isCurrent(captured, ['school-1', 'student-1'])).toBe(false)
    expect(() => assertGuardianCapabilitySupported('manual-period-switch')).toThrow(
      /Guardian self-service capability is blocked/,
    )
  })
})
