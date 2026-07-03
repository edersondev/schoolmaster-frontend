import { describe, expect, it, vi } from 'vitest'
import {
  findLoadedGuardianStudent,
  useGuardianLinkedStudents,
} from '@/composables/guardian/useGuardianLinkedStudents'
import { activeGuardianContext } from '../test-utils'

describe('useGuardianLinkedStudents', () => {
  it('loads linked students, caches by active school, and paginates', async () => {
    const service = {
      listGuardianStudents: vi.fn().mockResolvedValue({
        items: [{ id: 'student-1', fullName: 'Ada Student' }],
        meta: { page: 1, perPage: 25, total: 1 },
      }),
    }
    const composable = useGuardianLinkedStudents({ context: activeGuardianContext, service })
    await composable.load()
    expect(service.listGuardianStudents).toHaveBeenCalledWith(
      { page: 1, perPage: 25 },
      { schoolId: 'school-1' },
    )
    expect(findLoadedGuardianStudent('student-1', activeGuardianContext)).toMatchObject({
      fullName: 'Ada Student',
    })
    expect(findLoadedGuardianStudent('student-1', { schoolId: 'school-2' })).toBeNull()
  })

  it('distinguishes no active school, safe missing link, generic denial, and no linked students', async () => {
    const service = { listGuardianStudents: vi.fn().mockResolvedValue({ items: [], meta: {} }) }
    const noSchool = useGuardianLinkedStudents({ context: { ...activeGuardianContext, schoolId: null }, service })
    await noSchool.load()
    expect(noSchool.state.feedback.type).toBe('no-active-school')

    const noLink = useGuardianLinkedStudents({ context: { ...activeGuardianContext, safeNoGuardianLink: true }, service })
    await noLink.load()
    expect(noLink.state.feedback.type).toBe('no-guardian-link')

    const empty = useGuardianLinkedStudents({ context: activeGuardianContext, service })
    await empty.load()
    expect(empty.state.feedback.type).toBe('no-linked-students')
  })
})
