import { describe, expect, it, vi } from 'vitest'
import {
  findLoadedLearningSet,
  useAssignedLearningSets,
} from '@/composables/student/useAssignedLearningSets'
import { activeStudentContext } from '../test-utils'

describe('useAssignedLearningSets', () => {
  it('loads current-period assignments and caches loaded-list detail', async () => {
    const service = {
      listAssignedLearningSets: vi.fn().mockResolvedValue({
        items: [{ id: 'set-1', title: 'Set', entries: [] }],
        meta: { page: 1, perPage: 25, total: 1 },
      }),
    }
    const composable = useAssignedLearningSets({ context: activeStudentContext, service })
    await composable.load()
    expect(service.listAssignedLearningSets).toHaveBeenCalledWith(
      { academicPeriodId: 'period-1', page: 1, perPage: 25 },
      { schoolId: 'school-1' },
    )
    expect(findLoadedLearningSet('set-1', activeStudentContext)).toMatchObject({ title: 'Set' })
    expect(
      findLoadedLearningSet('set-1', {
        ...activeStudentContext,
        studentProfileId: 'student-2',
      }),
    ).toBeNull()
  })

  it('shows empty, no-current-period, and no-student-profile states', async () => {
    const emptyService = { listAssignedLearningSets: vi.fn().mockResolvedValue({ items: [], meta: {} }) }
    const empty = useAssignedLearningSets({ context: activeStudentContext, service: emptyService })
    await empty.load()
    expect(empty.state.feedback.type).toBe('empty')

    const noPeriod = useAssignedLearningSets({
      context: { schoolId: 'school-1', studentProfileId: 'student-1', academicPeriodId: null },
      service: emptyService,
    })
    await noPeriod.load()
    expect(noPeriod.state.feedback.type).toBe('no-current-period')

    const noProfile = useAssignedLearningSets({
      context: { schoolId: 'school-1', studentProfileId: null, academicPeriodId: 'period-1' },
      service: emptyService,
    })
    await noProfile.load()
    expect(noProfile.state.feedback.type).toBe('no-student-profile')
  })
})
