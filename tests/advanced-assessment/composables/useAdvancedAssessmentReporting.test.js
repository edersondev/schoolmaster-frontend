import { describe, expect, it } from 'vitest'
import { useAdvancedAssessmentReporting } from '@/composables/assessments/useAdvancedAssessmentReporting'

describe('useAdvancedAssessmentReporting', () => {
  it('blocks unsupported report fields before request', async () => {
    const reporting = useAdvancedAssessmentReporting({ service: { requestAggregateReport: async (input) => input } })
    reporting.state.requestedFields = ['score_summary', 'raw_answer_text']
    const run = await reporting.requestReport()
    expect(run.fields).toEqual(['score_summary'])
  })
})
