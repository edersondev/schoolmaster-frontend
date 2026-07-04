import { describe, expect, it } from 'vitest'
import { createPlatformSupportAccessState } from '@/composables/platform-support/usePlatformSupportAccess'
import { platformSession } from '../fixtures/platformSupportFixtures'

describe('usePlatformSupportAccess', () => {
  it('resolves authenticated actor and platform permission gates', () => {
    const state = createPlatformSupportAccessState(platformSession)
    expect(state.actorId.value).toBe('actor-1')
    expect(state.hasOperationalOversightAccess.value).toBe(true)
    expect(state.hasReportingOverviewAccess.value).toBe(true)
    expect(state.hasSupportAccess.value).toBe(true)
    expect(state.hasSupportApprovalAccess.value).toBe(true)
    expect(state.hasSupportRevocationAccess.value).toBe(true)
    expect(state.hasSupportDrillDownAccess.value).toBe(true)
    expect(state.hasSupportAuditReviewAccess.value).toBe(true)
    expect(state.workspaceStatus.value).toBe('ready')
  })

  it('distinguishes unauthenticated and denied actors', () => {
    expect(createPlatformSupportAccessState({ permissions: [] }).workspaceStatus.value).toBe('unauthorized')
    expect(createPlatformSupportAccessState({ currentUser: { id: 'actor-2' }, permissions: [] }).workspaceStatus.value).toBe('forbidden')
  })
})

