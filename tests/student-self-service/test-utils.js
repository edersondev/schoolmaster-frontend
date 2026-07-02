import { createI18n } from 'vue-i18n'
import { studentSelfServiceMessages } from '@/i18n/modules/studentSelfService'

export function createStudentI18n() {
  return createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        studentSelfService: studentSelfServiceMessages,
      },
    },
  })
}

export const activeStudentContext = {
  schoolId: 'school-1',
  studentProfileId: 'student-1',
  academicPeriodId: 'period-1',
}

export const learningSetRecord = {
  id: 'set-1',
  academic_period_id: 'period-1',
  title: 'Algebra set',
  status: 'published',
  published_at: '2026-07-01T10:00:00Z',
  private_path: '/private/nope',
  entries: [
    {
      entry_type: 'content_item',
      entry_reference_id: 'content-1',
      sequence: 2,
      title: 'Worksheet',
      content_item: {
        id: 'content-1',
        title: 'Worksheet PDF',
        content_type: 'application/pdf',
        file_size_bytes: 100,
        scan_status: 'clean',
        download_available: true,
        storage_key: 'hidden',
      },
    },
    {
      entry_type: 'questionnaire',
      entry_reference_id: 'questionnaire-1',
      sequence: 1,
      title: 'Warmup',
    },
  ],
}

export const gradeRecord = {
  id: 'grade-1',
  school_id: 'school-1',
  student_profile_id: 'student-1',
  academic_period_id: 'period-1',
  recorded_by_user_id: 'teacher-1',
  grade_value: 91,
  grade_label: 'A-',
  status: 'active',
  recorded_at: '2026-07-01T10:00:00Z',
}

export const attendanceRecord = {
  id: 'attendance-1',
  school_id: 'school-1',
  student_profile_id: 'student-1',
  academic_period_id: 'period-1',
  recorded_by_user_id: 'teacher-1',
  attendance_date: '2026-07-01',
  attendance_status: 'present',
  status: 'active',
}

export function paginated(data) {
  return { data, meta: { page: 1, per_page: 25, total: data.length } }
}
