import { describe, expect, it } from 'vitest'
import { createStudentWorkspaceContextState } from '@/composables/student/useStudentWorkspaceContext'
import { createGuardianWorkspaceContextState } from '@/composables/guardian/useGuardianWorkspaceContext'
import { createResolvedSystemAdministrator } from '../fixtures/masterAccess.fixtures'

describe('selected-subject boundary', () => {
  it('does not infer student profile from arbitrary selected subject', () => {
    const context = createStudentWorkspaceContextState(
      createResolvedSystemAdministrator({ selectedSubject: { id: 'student-2' } }),
    )
    expect(context.studentProfileId.value).toBeNull()
    expect(context.isReady.value).toBe(false)
  })

  it('does not infer guardian link from arbitrary selected subject', () => {
    const context = createGuardianWorkspaceContextState(
      createResolvedSystemAdministrator({
        selectedSubject: { id: 'student-2' },
        guardianAccessState: 'no-guardian-link',
      }),
    )
    expect(context.safeNoGuardianLink.value).toBe(true)
    expect(context.isReady.value).toBe(false)
  })
})
