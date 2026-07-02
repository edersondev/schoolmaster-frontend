import { createI18n } from 'vue-i18n'
import { guardianSelfServiceMessages } from '@/i18n/modules/guardianSelfService'

export function createGuardianI18n() {
  return createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        guardianSelfService: guardianSelfServiceMessages,
      },
    },
  })
}

export const activeGuardianContext = {
  schoolId: 'school-1',
  safeNoGuardianLink: false,
  academicPeriodId: 'period-1',
}

export const guardianStudentRecord = {
  id: 'student-1',
  school_id: 'school-1',
  registration_number: 'R-001',
  full_name: 'Ada Student',
  status: 'active',
  relationship_label: 'Mother',
  enrolled_at: '2026-01-01',
  private_notes: 'hidden',
}

export const guardianStudentDetailRecord = {
  ...guardianStudentRecord,
  first_name: 'Ada',
  last_name: 'Student',
  date_of_birth: '2012-03-04',
  enrollment_summary: {
    grade_level: '7',
    academic_year_label: '2026',
    school_only_notes: 'hidden',
  },
  other_guardians: [{ name: 'hidden' }],
}

export const academicSummaryRecord = {
  student: guardianStudentRecord,
  academic_period_id: 'period-1',
  grade_summary: {
    status: 'available',
    average: 92,
    scale: '100',
    correction_details: 'hidden',
  },
  attendance_summary: {
    status: 'available',
    total_absences: 1,
    total_tardies: 0,
    attendance_rate: 98,
  },
  learning_sets: [
    {
      learning_set_id: 'set-1',
      title: 'Algebra',
      status: 'in_progress',
      progress_percent: 50,
      last_activity_at: '2026-07-01',
      teacher_private_note: 'hidden',
    },
  ],
}

export const contactViewRecord = {
  student: guardianStudentRecord,
  guardian_contact: {
    name: 'Guardian One',
    email: 'guardian@example.test',
    phone: null,
    school_only_notes: 'hidden',
  },
  relationship_label: 'Mother',
  student_primary_contact: {
    name: 'Office Contact',
    phone: '555-0100',
    non_primary_contacts: ['hidden'],
  },
  other_guardians: [{ name: 'hidden' }],
}

export function paginated(data) {
  return { data, meta: { page: 1, per_page: 25, total: data.length } }
}
