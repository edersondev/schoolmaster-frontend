import { describe, expect, it } from 'vitest'
import { useTeacherWorkflowStaleGuard } from '@/modules/teacher-workflow/composables/useTeacherWorkflowStaleGuard'
import { redactTeacherWorkflowValue } from '@/modules/teacher-workflow/services/teacherWorkflowDiagnostics'
import { normalizeTeacherWorkflowError } from '@/modules/teacher-workflow/services/teacherWorkflowFeedbackMapper'

describe('teacher workflow foundation', () => {
  it('marks older tokens stale after scope changes', () => {
    const guard = useTeacherWorkflowStaleGuard()
    const first = guard.capture(['route-a'])
    guard.capture(['route-b'])
    expect(guard.isCurrent(first)).toBe(false)
  })

  it('redacts sensitive diagnostics', () => {
    expect(
      redactTeacherWorkflowValue({
        student_profile_id: 'student-1',
        token: 'secret',
        operationId: 'listGrades',
      }),
    ).toEqual({
      student_profile_id: '[redacted]',
      token: '[redacted]',
      operationId: 'listGrades',
    })
  })

  it('normalizes validation errors', () => {
    const feedback = normalizeTeacherWorkflowError({
      response: {
        status: 422,
        data: { errors: { title: ['Required'] } },
        headers: {},
      },
    })
    expect(feedback.type).toBe('validation')
    expect(feedback.fields.title).toEqual(['Required'])
  })
})
