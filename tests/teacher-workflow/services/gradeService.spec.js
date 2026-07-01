import { describe, expect, it } from 'vitest'
import {
  assertGradeScopedListSupported,
  mapGradeCorrectionRequest,
  mapGradeCreateRequest,
} from '@/modules/teacher-workflow/services/gradeService'

describe('gradeService contract and request mappers', () => {
  it('blocks undocumented scoped list filters', () => {
    expect(() => assertGradeScopedListSupported({ classSectionId: 'section-1' })).toThrow(
      /Grade scoped filters/,
    )
  })

  it('maps create and correction requests', () => {
    expect(mapGradeCreateRequest({ studentProfileId: 'student-1', academicPeriodId: 'period-1', gradeValue: '92' })).toMatchObject({
      student_profile_id: 'student-1',
      academic_period_id: 'period-1',
      grade_value: 92,
    })
    expect(mapGradeCorrectionRequest({ gradeValue: '93', correctionReason: 'valid reason' })).toMatchObject({
      grade_value: 93,
      correction_reason: 'valid reason',
    })
  })
})
