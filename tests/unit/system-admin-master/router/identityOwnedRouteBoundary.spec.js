import { describe, expect, it } from 'vitest'
import { createStudentWorkspaceContextState } from '@/composables/student/useStudentWorkspaceContext'
import { createGuardianWorkspaceContextState } from '@/composables/guardian/useGuardianWorkspaceContext'
import { createResolvedSystemAdministrator } from '../fixtures/masterAccess.fixtures'

describe('identity-owned route boundary', () => {
  it('does not create student actor context from master role', () => {
    const context = createStudentWorkspaceContextState(
      createResolvedSystemAdministrator({ activeStudentProfile: null }),
    )

    expect(context.isReady.value).toBe(false)
    expect(context.workspaceStatus.value).toBe('no-student-profile')
  })

  it('does not bypass missing guardian link with master role', () => {
    const context = createGuardianWorkspaceContextState(
      createResolvedSystemAdministrator({ guardianAccessState: 'no-guardian-link' }),
    )

    expect(context.isReady.value).toBe(false)
    expect(context.workspaceStatus.value).toBe('no-guardian-link')
  })
})
