import { describe, expect, it } from 'vitest'
import { validateCorrectionReason } from '@/modules/teacher-workflow/composables/useGrades'

describe('academic record composables', () => {
  it('validates correction reason length', () => {
    expect(validateCorrectionReason('short')).toMatch(/10/)
    expect(validateCorrectionReason('a'.repeat(501))).toMatch(/500/)
    expect(validateCorrectionReason('valid reason')).toBe('')
  })
})
