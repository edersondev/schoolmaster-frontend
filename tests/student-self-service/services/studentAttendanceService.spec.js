import { describe, expect, it, vi } from 'vitest'
import { mapStudentAttendanceRecord } from '@/contracts/student/studentSelfServiceMappers'
import { createStudentSelfServiceService } from '@/services/student/studentSelfServiceService'
import { attendanceRecord, paginated } from '../test-utils'

describe('student attendance service', () => {
  it('maps student-visible attendance fields and drops private fields', () => {
    const mapped = mapStudentAttendanceRecord({ ...attendanceRecord, internal_note: 'hidden' })
    expect(mapped).toMatchObject({ id: 'attendance-1', attendanceDate: '2026-07-01', attendanceStatus: 'present' })
    expect(mapped.droppedFields).toContain('internal_note')
  })

  it('lists attendance with current active academic period only', async () => {
    const client = { get: vi.fn().mockResolvedValue({ data: paginated([attendanceRecord]) }) }
    const service = createStudentSelfServiceService({ client })
    await service.listStudentAttendance({ academicPeriodId: 'period-1', page: 1, perPage: 25 }, { schoolId: 'school-1' })
    expect(client.get).toHaveBeenCalledWith(
      '/api/v1/student/attendance',
      expect.objectContaining({ params: { academic_period_id: 'period-1', page: 1, per_page: 25 } }),
    )
  })
})
