import { computed } from 'vue'
import { REPORTING_FEEDBACK_STATES } from '@/contracts/reporting/reportingContract'

export function useReportRunDetail({ history, reportRunId } = {}) {
  const run = computed(() => {
    const id = reportRunId?.value ?? reportRunId ?? history?.state?.selectedRunId
    return (history?.state?.items ?? []).find((item) => item.id === id) ?? history?.selectedRun?.value ?? null
  })
  const feedback = computed(() => (run.value ? null : { type: REPORTING_FEEDBACK_STATES.notFound }))
  return { run, feedback, isAvailable: computed(() => Boolean(run.value)) }
}
