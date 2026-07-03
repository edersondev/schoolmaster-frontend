import { describe, expect, it } from 'vitest'
import { createReportingRequestKey, useReportingRequestGuards } from '@/composables/reporting/useReportingRequestGuards'

describe('useReportingRequestGuards', () => {
  it('detects stale responses and keeps diagnostics safe', () => {
    const guards = useReportingRequestGuards()
    const key = guards.beginRequest(['history', 'school-1'])
    guards.beginRequest(['history', 'school-2'])
    expect(guards.ignoreIfStale(key)).toBe(true)
    expect(guards.staleFeedback.value.type).toBe('stale-response')
    expect(guards.safeDiagnostic({ operationId: 'listReports', schoolId: 'hidden' })).toEqual({
      operationId: 'listReports',
      requestId: null,
      status: 0,
      code: null,
      routeName: null,
    })
  })

  it('creates stable request keys', () => {
    expect(createReportingRequestKey(['a', { b: 1 }])).toBe('"a"|{"b":1}')
  })
})
