import { describe, expect, it } from 'vitest'
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
