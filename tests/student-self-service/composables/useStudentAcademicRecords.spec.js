import { describe, expect, it, vi } from 'vitest'
import {
  findLoadedAcademicRecord,
  useStudentAcademicRecords,
} from '@/composables/student/useStudentAcademicRecords'
import { activeStudentContext } from '../test-utils'

describe('useStudentAcademicRecords', () => {
  it('loads grades with current period and backs detail from loaded list', async () => {
    const service = {
      listStudentGrades: vi.fn().mockResolvedValue({
        items: [{ id: 'grade-1', gradeValue: 91, status: 'active' }],
        meta: { page: 1, perPage: 25, total: 1 },
      }),
    }
    const composable = useStudentAcademicRecords({ type: 'grades', context: activeStudentContext, service })
    await composable.load()
    expect(service.listStudentGrades).toHaveBeenCalledWith(
      { academicPeriodId: 'period-1', page: 1, perPage: 25 },
      { schoolId: 'school-1' },
    )
    expect(findLoadedAcademicRecord('grades', 'grade-1', activeStudentContext)).toMatchObject({ gradeValue: 91 })
    expect(
      findLoadedAcademicRecord('grades', 'grade-1', {
        ...activeStudentContext,
        studentProfileId: 'student-2',
      }),
    ).toBeNull()
  })

  it('blocks attendance request without current period', async () => {
    const service = { listStudentAttendance: vi.fn() }
    const composable = useStudentAcademicRecords({
      type: 'attendance',
      context: { schoolId: 'school-1', studentProfileId: 'student-1', academicPeriodId: null },
      service,
    })
    await composable.load()
    expect(service.listStudentAttendance).not.toHaveBeenCalled()
    expect(composable.state.feedback.type).toBe('no-current-period')
  })
})
