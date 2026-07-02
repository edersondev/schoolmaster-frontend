import { describe, expect, it, vi } from 'vitest'
import { useGuardianStudentDetail } from '@/composables/guardian/useGuardianStudentDetail'
import { activeGuardianContext } from '../test-utils'

describe('useGuardianStudentDetail', () => {
  it('loads selected student detail and maps denied target to safe not-found', async () => {
    const service = {
      getGuardianStudent: vi
        .fn()
        .mockResolvedValueOnce({ id: 'student-1', fullName: 'Ada Student' })
        .mockRejectedValueOnce({ type: 'forbidden' }),
    }
    const detail = useGuardianStudentDetail({
      route: { params: { studentProfileId: 'student-1' } },
      context: activeGuardianContext,
      service,
    })
    await detail.load()
    expect(detail.state.student.fullName).toBe('Ada Student')

    const denied = useGuardianStudentDetail({
      route: { params: { studentProfileId: 'student-2' } },
      context: activeGuardianContext,
      service,
    })
    await denied.load()
    expect(denied.state.feedback.type).toBe('not-found')
  })
})
