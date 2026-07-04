import { describe, expect, it } from 'vitest'
import { filterAdvancedAssessmentReportFields, mapReportAggregate } from '@/services/assessments/advancedAssessmentReportingService'

describe('advanced assessment reporting service', () => {
  it('allows aggregate fields and blocks raw answer/file fields', () => {
    expect(filterAdvancedAssessmentReportFields(['assessment_counts', 'raw_answer_text', 'file_links', 'score_summary'])).toEqual([
      'assessment_counts',
      'score_summary',
    ])
    expect(mapReportAggregate({ assessment_counts: { submitted: 2 }, raw_answers: ['hidden'] })).toEqual(
      expect.objectContaining({ counts: { submitted: 2 } }),
    )
  })
})
