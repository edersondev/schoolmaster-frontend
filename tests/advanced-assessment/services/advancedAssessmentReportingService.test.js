import { describe, expect, it } from 'vitest'
import {
  createAdvancedAssessmentReportingService,
  filterAdvancedAssessmentReportFields,
  mapReportAggregate,
} from '@/services/assessments/advancedAssessmentReportingService'
import { mapReportRequestPayload } from '@/contracts/reporting/reportingContract'

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

  it('serializes sanitized aggregate fields into the report request payload', async () => {
    let payload
    const service = createAdvancedAssessmentReportingService({
      requestReport: async (input) => {
        payload = mapReportRequestPayload(input)
        return { id: 'run-1' }
      },
    })

    await service.requestAggregateReport({ fields: ['assessment_counts', 'raw_answer_text', 'score_summary'] })

    expect(payload.fields).toEqual(['assessment_counts', 'score_summary'])
  })
})
