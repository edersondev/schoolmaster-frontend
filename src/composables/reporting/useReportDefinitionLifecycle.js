import { reactive, readonly } from 'vue'
import { REPORTING_FEEDBACK_STATES } from '@/contracts/reporting/reportingContract'
import { reportingService } from '@/services/reporting/reportingService'

export function useReportDefinitionLifecycle({ access, definitions, service = reportingService } = {}) {
  const state = reactive({ pendingAction: '', feedback: null })

  async function submit(definition, action) {
    if (!definition?.id) {
      state.feedback = { type: REPORTING_FEEDBACK_STATES.notFound }
      return null
    }
    state.pendingAction = action
    state.feedback = { type: REPORTING_FEEDBACK_STATES.loading }
    const schoolId = access?.schoolId?.value ?? access?.schoolId
    try {
      const input = { reportDefinitionId: definition.id }
      const returned =
        action === 'activate'
          ? await service.activateReportDefinition(input, { schoolId })
          : action === 'deactivate'
            ? await service.deactivateReportDefinition(input, { schoolId })
            : action === 'delete'
              ? await service.deleteReportDefinition(input, { schoolId })
              : await service.restoreReportDefinition(input, { schoolId })
      definitions?.applyDefinition?.(returned)
      state.feedback = { type: REPORTING_FEEDBACK_STATES.success }
      return returned
    } catch (error) {
      state.feedback = error
      return null
    } finally {
      state.pendingAction = ''
    }
  }

  return {
    state: readonly(state),
    submit,
  }
}
