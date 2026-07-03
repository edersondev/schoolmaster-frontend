import { describe, expect, it } from 'vitest'
import {
  safePlatformSupportDiagnostic,
  usePlatformSupportRequestGuards,
} from '@/composables/platform-support/usePlatformSupportRequestGuards'

describe('usePlatformSupportRequestGuards', () => {
  it('ignores stale responses and keeps diagnostics safe', () => {
    const guards = usePlatformSupportRequestGuards()
    const first = guards.beginRequest(['summary', 1])
    guards.beginRequest(['summary', 2])
    expect(guards.ignoreIfStale(first)).toBe(true)
    expect(guards.hasStaleResponse.value).toBe(true)
    expect(
      safePlatformSupportDiagnostic({
        operationId: 'listPlatformSchoolSummaries',
        requestId: 'req-1',
        status: 403,
        token: 'secret',
      }),
    ).toEqual({ operationId: 'listPlatformSchoolSummaries', requestId: 'req-1', status: 403, code: null, routeName: null })
  })
})

