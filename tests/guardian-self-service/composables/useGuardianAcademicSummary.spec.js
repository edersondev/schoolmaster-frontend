import { describe, expect, it, vi } from 'vitest'
import { useGuardianAcademicSummary } from '@/composables/guardian/useGuardianAcademicSummary'
import { activeGuardianContext } from '../test-utils'

describe('useGuardianAcademicSummary', () => {
  it('requires current academic period and maps unavailable summary', async () => {
    const service = {
      getGuardianStudentAcademics: vi.fn().mockResolvedValue({
        gradeSummary: null,
        attendanceSummary: null,
        learningSets: [],
      }),
    }
    const noPeriod = useGuardianAcademicSummary({
      route: { params: { studentProfileId: 'student-1' } },
      context: { ...activeGuardianContext, academicPeriodId: null },
      service,
    })
    await noPeriod.load()
    expect(noPeriod.state.feedback.type).toBe('no-academic-period')
    expect(service.getGuardianStudentAcademics).not.toHaveBeenCalled()

    const summary = useGuardianAcademicSummary({
      route: { params: { studentProfileId: 'student-1' } },
      context: activeGuardianContext,
      service,
    })
    await summary.load()
    expect(summary.state.feedback.type).toBe('unavailable-summary')
  })
})
