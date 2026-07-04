import { mapReportAggregate } from '@/contracts/assessments/advancedAssessmentContract'
import { reportingService } from '@/services/reporting/reportingService'

export { mapReportAggregate }

const ALLOWED_FIELDS = Object.freeze([
  'assessment_counts',
  'completion_status',
  'grading_status',
  'score_summary',
])

export function filterAdvancedAssessmentReportFields(fields = []) {
  return fields.filter((field) => ALLOWED_FIELDS.includes(field))
}

export function createAdvancedAssessmentReportingService(service = reportingService) {
  return {
    getCatalog: (options) => service.getReportCatalog(options),
    requestAggregateReport(input = {}, options) {
      return service.requestReport({
        ...input,
        fields: filterAdvancedAssessmentReportFields(input.fields ?? ALLOWED_FIELDS),
      }, options)
    },
  }
}

export const advancedAssessmentReportingService = createAdvancedAssessmentReportingService()
