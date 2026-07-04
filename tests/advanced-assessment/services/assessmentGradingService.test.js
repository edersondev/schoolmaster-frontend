import { describe, expect, it } from 'vitest'
import { mapFailedScanActionPayload, mapManualGradingPayload } from '@/services/assessments/assessmentGradingService'

describe('assessment grading service', () => {
  it('validates manual scores and failed scan actions', () => {
    expect(mapManualGradingPayload({ answerId: 'a1', score: 101 }).valid).toBe(false)
    expect(mapManualGradingPayload({ answerId: 'a1', score: 100 }).payload.score).toBe(100)
    expect(mapFailedScanActionPayload({ answerId: 'a2', action: 'exempt' }).payload.failed_scan_action).toBe('exempt')
  })
})
