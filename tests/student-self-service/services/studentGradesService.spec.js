import { describe, expect, it, vi } from 'vitest'
import { mapStudentGradeRecord } from '@/contracts/student/studentSelfServiceMappers'
import { createStudentSelfServiceService } from '@/services/student/studentSelfServiceService'
import { gradeRecord, paginated } from '../test-utils'

describe('student grades service', () => {
  it('maps student-visible grade fields and drops private fields', () => {
    const mapped = mapStudentGradeRecord({ ...gradeRecord, correction_note: 'hidden' })
    expect(mapped).toMatchObject({ id: 'grade-1', gradeValue: 91, gradeLabel: 'A-', status: 'active' })
    expect(mapped.droppedFields).toContain('correction_note')
  })

  it('lists grades with current active academic period only', async () => {
    const client = { get: vi.fn().mockResolvedValue({ data: paginated([gradeRecord]) }) }
    const service = createStudentSelfServiceService({ client })
    await service.listStudentGrades({ academicPeriodId: 'period-1', page: 1, perPage: 25 }, { schoolId: 'school-1' })
    expect(client.get).toHaveBeenCalledWith(
      '/api/v1/student/grades',
      expect.objectContaining({ params: { academic_period_id: 'period-1', page: 1, per_page: 25 } }),
    )
  })
})
