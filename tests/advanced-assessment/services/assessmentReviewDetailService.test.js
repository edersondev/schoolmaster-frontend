import { describe, expect, it } from 'vitest'
import { mapResponseAttempt } from '@/contracts/assessments/advancedAssessmentContract'

describe('assessment review detail service', () => {
  it('maps clean download availability without inline preview details', () => {
    const response = mapResponseAttempt({ files: [{ file_id: 'f1', display_name: 'answer.pdf', scan_status: 'clean', url: 'hidden' }] })
    expect(response.files[0].downloadAllowed).toBe(true)
    expect(response.files[0]).not.toHaveProperty('url')
  })
})
