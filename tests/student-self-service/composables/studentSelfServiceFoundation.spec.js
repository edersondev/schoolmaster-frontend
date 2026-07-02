import { describe, expect, it, vi } from 'vitest'
import { createStudentWorkspaceContextState } from '@/composables/student/useStudentWorkspaceContext'
import { useStudentSelfServiceStaleGuard } from '@/composables/student/useStudentSelfServiceStaleGuard'
import { redactStudentSelfServiceValue } from '@/services/student/studentSelfServiceDiagnostics'
import { normalizeStudentSelfServiceError } from '@/services/student/studentSelfServiceFeedbackMapper'
import { mapAuthSession } from '@/contracts/auth/authSession.contract'

describe('student self-service foundation', () => {
  it('resolves context gates for active school, linked profile, and current period', () => {
    const context = createStudentWorkspaceContextState({
      activeSchool: { id: 'school-1' },
      currentUser: { student_profile_id: 'student-1' },
      currentAcademicPeriod: { id: 'period-1' },
    })
    expect(context.workspaceStatus.value).toBe('ready')
    expect(context.defaultRoute.name).toBe('studentAssignedLearningSets')
  })

  it('preserves student profile and current period from authenticated session payload', () => {
    const session = mapAuthSession({
      token: 'token',
      user: { id: 'user-1', full_name: 'Student One', email: 's@example.com', status: 'active' },
      roles: [{ scope: 'school', status: 'active' }],
      permissions: [],
      resolved_school: { id: 'school-1', name: 'Northfield', status: 'active' },
      active_student_profile: { id: 'student-1', full_name: 'Student One', status: 'active' },
      current_academic_period: { id: 'period-1', name: '2026 Term', status: 'active' },
    })
    const context = createStudentWorkspaceContextState(session)
    expect(context.studentProfileId.value).toBe('student-1')
    expect(context.academicPeriodId.value).toBe('period-1')
  })

  it('blocks missing active school, linked profile, and current period distinctly', () => {
    expect(createStudentWorkspaceContextState({}).workspaceStatus.value).toBe('no-active-school')
    expect(
      createStudentWorkspaceContextState({ activeSchool: { id: 'school-1' } }).workspaceStatus.value,
    ).toBe('no-student-profile')
    expect(
      createStudentWorkspaceContextState({
        activeSchool: { id: 'school-1' },
        currentUser: { student_profile_id: 'student-1' },
      }).workspaceStatus.value,
    ).toBe('no-current-period')
  })

  it('normalizes auth/session failures and redacts sensitive diagnostics', () => {
    const normalized = normalizeStudentSelfServiceError(
      { response: { status: 401, data: { error: { code: 'UNAUTHORIZED' } } } },
      { operationId: 'listStudentLearningSets' },
    )
    expect(normalized.type).toBe('unauthorized')
    expect(
      redactStudentSelfServiceValue({
        token: 'secret',
        privateFilePath: '/tmp/private',
        roleInternals: ['admin'],
        operationId: 'safe',
      }),
    ).toEqual({
      token: '[redacted]',
      privateFilePath: '[redacted]',
      roleInternals: '[redacted]',
      operationId: 'safe',
    })
  })

  it('detects stale responses after context changes', () => {
    const guard = useStudentSelfServiceStaleGuard()
    const first = guard.capture(['school-1'])
    guard.capture(['school-2'])
    expect(guard.isCurrent(first, ['school-1'])).toBe(false)
  })

  it('does not request data when context gate blocks', async () => {
    const service = { listAssignedLearningSets: vi.fn() }
    const composable = (await import('@/composables/student/useAssignedLearningSets')).useAssignedLearningSets({
      context: { schoolId: null, studentProfileId: 'student-1', academicPeriodId: 'period-1' },
      service,
    })
    await composable.load()
    expect(service.listAssignedLearningSets).not.toHaveBeenCalled()
    expect(composable.state.feedback.type).toBe('no-active-school')
  })
})
