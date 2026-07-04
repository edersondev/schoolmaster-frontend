import { computed, reactive } from 'vue'
import {
  advancedAssessmentReportingService,
  filterAdvancedAssessmentReportFields,
} from '@/services/assessments/advancedAssessmentReportingService'

export function useAdvancedAssessmentReporting({ service = advancedAssessmentReportingService, options = {} } = {}) {
  const state = reactive({
    loading: false,
    feedback: null,
    catalog: null,
    run: null,
    requestedFields: ['assessment_counts', 'completion_status', 'grading_status', 'score_summary'],
  })
  const allowedFields = computed(() => filterAdvancedAssessmentReportFields(state.requestedFields))

  async function loadCatalog() {
    state.loading = true
    try {
      state.catalog = await service.getCatalog(options)
      state.feedback = null
    } catch (error) {
      state.feedback = error
    } finally {
      state.loading = false
    }
  }

  async function requestReport(input = {}) {
    state.loading = true
    try {
      state.run = await service.requestAggregateReport({ ...input, fields: allowedFields.value }, options)
      state.feedback = { type: 'success' }
      return state.run
    } catch (error) {
      state.feedback = error
      return null
    } finally {
      state.loading = false
    }
  }

  return { state, allowedFields, loadCatalog, requestReport }
}
