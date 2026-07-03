import { computed, reactive, readonly } from 'vue'
import { REPORTING_FEEDBACK_STATES, REPORT_OUTPUT_AVAILABILITY } from '@/contracts/reporting/reportingContract'
import { reportingService } from '@/services/reporting/reportingService'
import { startReportDownload } from '@/services/reporting/reportingDownloadAdapter'

export function useReportDownloads({ access, service = reportingService, downloadAdapter = startReportDownload } = {}) {
  const state = reactive({
    pendingFormat: '',
    feedback: null,
    lastDownload: null,
  })

  function availabilityFor(run, format) {
    return (
      run?.outputs?.find((output) => output.format === format)?.availability ??
      REPORT_OUTPUT_AVAILABILITY.unsupported
    )
  }

  function canDownload(run, format) {
    const hasAccess = access?.hasReportAccess?.value ?? access?.hasReportAccess
    return Boolean(run?.id && hasAccess && availabilityFor(run, format) === REPORT_OUTPUT_AVAILABILITY.available)
  }

  async function download(run, format) {
    if (!canDownload(run, format)) {
      state.feedback = { type: REPORTING_FEEDBACK_STATES.downloadUnavailable }
      return null
    }
    state.pendingFormat = format
    state.feedback = { type: REPORTING_FEEDBACK_STATES.loading }
    try {
      const response = await service.downloadReport(
        { reportRunId: run.id, format },
        { schoolId: access?.schoolId?.value ?? access?.schoolId },
      )
      state.lastDownload = downloadAdapter(response)
      state.feedback = { type: REPORTING_FEEDBACK_STATES.success }
      return state.lastDownload
    } catch (error) {
      state.feedback = error
      return null
    } finally {
      state.pendingFormat = ''
    }
  }

  return {
    state: readonly(state),
    isDownloading: computed(() => Boolean(state.pendingFormat)),
    availabilityFor,
    canDownload,
    download,
  }
}
