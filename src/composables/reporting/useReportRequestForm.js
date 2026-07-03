import { computed, reactive } from 'vue'
import { reportingService } from '@/services/reporting/reportingService'
import {
  REPORTING_FEEDBACK_STATES,
  REPORT_DEFINITION_STATES,
} from '@/contracts/reporting/reportingContract'

export function createReportRequestDraft() {
  return {
    reportType: '',
    reportDefinitionId: '',
    filters: [],
    outputFormats: [],
  }
}

export function useReportRequestForm({ access, catalog, definitions = null, service = reportingService } = {}) {
  const state = reactive({
    draft: createReportRequestDraft(),
    submitting: false,
    acceptedRun: null,
    feedback: null,
  })

  const activeDefinitions = computed(() =>
    (definitions?.items?.value ?? definitions?.state?.items ?? []).filter(
      (definition) => definition.lifecycleState === REPORT_DEFINITION_STATES.active,
    ),
  )

  const validation = computed(() => {
    const errors = {}
    if (!state.draft.reportType && !state.draft.reportDefinitionId) errors.report = 'required'
    if (!Array.isArray(state.draft.outputFormats) || state.draft.outputFormats.length === 0) {
      errors.outputFormats = 'required'
    }
    const unsupported = state.draft.outputFormats.filter((format) => !catalog?.isSupportedFormat?.(format))
    if (unsupported.length) errors.outputFormats = 'unsupported'
    if (state.draft.reportDefinitionId) {
      const definition = activeDefinitions.value.find((item) => item.id === state.draft.reportDefinitionId)
      if (!definition) errors.reportDefinitionId = 'inactive'
    }
    return errors
  })

  const canSubmit = computed(() => {
    const schoolId = access?.schoolId?.value ?? access?.schoolId
    const hasAccess = access?.hasReportAccess?.value ?? access?.hasReportAccess
    return Boolean(schoolId && hasAccess && Object.keys(validation.value).length === 0 && !state.submitting)
  })

  function resetDraft(input = {}) {
    Object.assign(state.draft, createReportRequestDraft(), input)
    state.feedback = null
    state.acceptedRun = null
  }

  async function submit() {
    if (!canSubmit.value) {
      state.feedback = { type: REPORTING_FEEDBACK_STATES.validation, fields: validation.value }
      return null
    }

    state.submitting = true
    state.feedback = { type: REPORTING_FEEDBACK_STATES.loading }
    try {
      const run = await service.requestReport(state.draft, {
        schoolId: access?.schoolId?.value ?? access?.schoolId,
      })
      state.acceptedRun = run
      state.feedback = { type: REPORTING_FEEDBACK_STATES.success }
      return run
    } catch (error) {
      state.feedback = error
      return null
    } finally {
      state.submitting = false
    }
  }

  return {
    state,
    validation,
    canSubmit,
    activeDefinitions,
    resetDraft,
    submit,
  }
}
