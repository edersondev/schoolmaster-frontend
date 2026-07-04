import { describe, expect, it } from 'vitest'
import { useAdvancedAssessmentRequestGuards } from '@/composables/assessments/useAdvancedAssessmentRequestGuards'

describe('useAdvancedAssessmentRequestGuards', () => {
  it('marks older route and filter responses stale', () => {
    const guard = useAdvancedAssessmentRequestGuards()
    const first = guard.capture(['route-a', 'school-1'])
    const second = guard.capture(['route-b', 'school-1'])
    expect(guard.isCurrent(first)).toBe(false)
    expect(guard.isCurrent(second)).toBe(true)
    expect(guard.staleFeedback().type).toBe('stale-response')
  })
})
