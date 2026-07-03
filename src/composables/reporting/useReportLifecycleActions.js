import { computed, reactive } from 'vue'
import {
  REPORTING_FEEDBACK_STATES,
  REPORT_GENERATION_STATUSES,
  REPORT_OUTPUT_AVAILABILITY,
  REPORT_REASON_CODES,
} from '@/contracts/reporting/reportingContract'
import { reportingService } from '@/services/reporting/reportingService'

export function useReportLifecycleActions({ access, history, service = reportingService } = {}) {
  const state = reactive({
    pendingAction: '',
    feedback: null,
    reasonCode: REPORT_REASON_CODES[0],
  })

  const hasLifecycleAccess = computed(() => access?.hasLifecycleAccess?.value ?? access?.hasLifecycleAccess)
  const reasonOptions = computed(() => REPORT_REASON_CODES)

  function hasExpiredOutput(run) {
    return (run?.outputs ?? []).some((output) => output.availability === REPORT_OUTPUT_AVAILABILITY.expired)
  }

  function availableActions(run) {
    if (!run || !hasLifecycleAccess.value) return []
    const actions = []
    if (run.generationStatus === REPORT_GENERATION_STATUSES.failed || hasExpiredOutput(run)) actions.push('retry')
    if ([REPORT_GENERATION_STATUSES.requested, REPORT_GENERATION_STATUSES.generating].includes(run.generationStatus)) {
      actions.push('cancel')
    }
    if (run.deletedAt) actions.push('restore')
    else actions.push('delete')
    return actions
  }

  async function submit(run, action, reasonCode = state.reasonCode) {
    if (!availableActions(run).includes(action)) {
      state.feedback = { type: REPORTING_FEEDBACK_STATES.validation }
      return null
    }
    state.pendingAction = action
    state.feedback = { type: REPORTING_FEEDBACK_STATES.loading }
    const schoolId = access?.schoolId?.value ?? access?.schoolId
    try {
      const input = { reportRunId: run.id, reasonCode }
      const returned =
        action === 'retry'
          ? await service.retryReport(input, { schoolId })
          : action === 'cancel'
            ? await service.cancelReport(input, { schoolId })
            : action === 'delete'
              ? await service.deleteReport(input, { schoolId })
              : await service.restoreReport(input, { schoolId })
      history?.applyReturnedRun?.(returned)
      state.feedback = { type: REPORTING_FEEDBACK_STATES.success }
      return returned
    } catch (error) {
      state.feedback = error
      return null
    } finally {
      state.pendingAction = ''
    }
  }

  function setReasonCode(reasonCode) {
    state.reasonCode = reasonCode
  }

  return {
    state,
    reasonOptions,
    availableActions,
    setReasonCode,
    submit,
  }
}
