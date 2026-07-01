import { describe, expect, it } from 'vitest'
import {
  assertAttendanceScopedListSupported,
  mapAttendanceCreateRequest,
} from '@/modules/teacher-workflow/services/attendanceService'

describe('attendanceService contract and request mappers', () => {
  it('blocks undocumented scoped list filters', () => {
    expect(() => assertAttendanceScopedListSupported({ academicPeriodId: 'period-1' })).toThrow(
      /Attendance scoped filters/,
    )
  })

  it('maps attendance create request', () => {
    expect(
      mapAttendanceCreateRequest({
        studentProfileId: 'student-1',
        academicPeriodId: 'period-1',
        attendanceDate: '2026-07-01',
        attendanceStatus: 'present',
      }),
    ).toEqual({
      student_profile_id: 'student-1',
      academic_period_id: 'period-1',
      attendance_date: '2026-07-01',
      attendance_status: 'present',
    })
  })
})
