import { describe, expect, it } from 'vitest'
import { useAdvancedAssessmentAccess } from '@/composables/assessments/useAdvancedAssessmentAccess'

describe('useAdvancedAssessmentAccess', () => {
  it('gates active school, student, and permissions', () => {
    const session = {
      isAuthenticated: true,
      currentUser: { id: 'u1' },
      activeSchool: { id: 's1' },
      activeStudentProfile: { id: 'st1' },
      hasPermission: (code) => code === 'assessments.responses.submit',
    }
    const access = useAdvancedAssessmentAccess({ session })
    expect(access.canSubmit.value.allowed).toBe(true)
    expect(access.canAuthor.value.feedback.type).toBe('contract-unavailable')
  })
})
