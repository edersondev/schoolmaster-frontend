import { computed, reactive } from 'vue'
import {
  REPORTING_FEEDBACK_STATES,
  REPORT_DEFINITION_LIMITS,
  REPORT_DEFINITION_STATES,
} from '@/contracts/reporting/reportingContract'
import { reportingService } from '@/services/reporting/reportingService'

export function createDefinitionDraft(definition = {}) {
  return {
    id: definition.id ?? '',
    name: definition.name ?? '',
    description: definition.description ?? '',
    domain: definition.domain ?? '',
    fields: [...(definition.fields ?? [])],
    filters: [...(definition.filters ?? [])],
    grouping: [...(definition.grouping ?? [])],
    sorting: [...(definition.sorting ?? [])],
    outputFormats: [...(definition.outputFormats ?? [])],
    lifecycleState: definition.lifecycleState ?? REPORT_DEFINITION_STATES.draft,
  }
}

export function useReportDefinitionEditor({ access, definitions, service = reportingService } = {}) {
  const state = reactive({
    draft: createDefinitionDraft(),
    submitting: false,
    feedback: null,
  })

  const isActive = computed(() => state.draft.lifecycleState === REPORT_DEFINITION_STATES.active)
  const complexityUsage = computed(() => ({
    fields: state.draft.fields.length,
    filters: state.draft.filters.length,
    grouping: state.draft.grouping.length,
    sorting: state.draft.sorting.length,
  }))
  const validation = computed(() => {
    const errors = {}
    if (!state.draft.name) errors.name = 'required'
    if (!isActive.value && !state.draft.domain) errors.domain = 'required'
    Object.entries(complexityUsage.value).forEach(([key, value]) => {
      if (value > REPORT_DEFINITION_LIMITS[key]) errors[key] = 'limit'
    })
    if (!isActive.value && state.draft.outputFormats.length === 0) errors.outputFormats = 'required'
    return errors
  })
  const canSubmit = computed(() => Object.keys(validation.value).length === 0 && !state.submitting)

  function edit(definition = {}) {
    Object.assign(state.draft, createDefinitionDraft(definition))
    state.feedback = null
  }

  async function submit() {
    if (!canSubmit.value) {
      state.feedback = { type: REPORTING_FEEDBACK_STATES.validation, fields: validation.value }
      return null
    }
    state.submitting = true
    state.feedback = { type: REPORTING_FEEDBACK_STATES.loading }
    const schoolId = access?.schoolId?.value ?? access?.schoolId
    try {
      const saved = state.draft.id
        ? await service.updateReportDefinition(
            { reportDefinitionId: state.draft.id, definition: state.draft },
            { schoolId },
          )
        : await service.createReportDefinition(state.draft, { schoolId })
      definitions?.applyDefinition?.(saved)
      edit(saved)
      state.feedback = { type: REPORTING_FEEDBACK_STATES.success }
      return saved
    } catch (error) {
      state.feedback = error
      return null
    } finally {
      state.submitting = false
    }
  }

  return {
    state,
    isActive,
    complexityUsage,
    validation,
    canSubmit,
    edit,
    submit,
  }
}
