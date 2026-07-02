import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import StudentAcademicRecordDetail from '@/components/student/StudentAcademicRecordDetail.vue'
import { createStudentI18n } from '../test-utils'

describe('student academic record views', () => {
  it('renders read-only grade and attendance details without correction/import/restore controls', () => {
    const global = {
      plugins: [createStudentI18n()],
      stubs: { ElTag: true, ElPagination: true },
    }
    const grade = mount(StudentAcademicRecordDetail, {
      props: { type: 'grades', record: { gradeValue: 91, gradeLabel: 'A-', status: 'active' } },
      global,
    })
    expect(grade.text()).toContain('Grade record is read-only')
    expect(grade.text()).not.toMatch(/Correction|Import|Restore/)

    const attendance = mount(StudentAcademicRecordDetail, {
      props: { type: 'attendance', record: { attendanceDate: '2026-07-01', attendanceStatus: 'present', status: 'active' } },
      global,
    })
    expect(attendance.text()).toContain('Attendance record is read-only')
    expect(attendance.text()).not.toMatch(/Correction|Import|Restore/)
  })
})
