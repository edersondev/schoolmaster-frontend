export const school = { id: 'school-1', name: 'North School', status: 'active' }

export const academicPeriod = {
  id: 'period-1',
  name: '2026 Term 1',
  status: 'active',
  is_current: true,
}

export const studentProfile = {
  id: 'student-1',
  school_id: school.id,
  registration_number: 'STU-001',
  first_name: 'Ana',
  last_name: 'Silva',
  full_name: 'Ana Silva',
  status: 'active',
  enrolled_at: '2026-02-01',
}

export const classSection = {
  id: 'section-1',
  school_id: school.id,
  academic_period_id: academicPeriod.id,
  code: 'MATH-1',
  name: 'Math 1',
  status: 'active',
}

export const rosterMembership = {
  id: 'membership-1',
  school_id: school.id,
  class_section_id: classSection.id,
  student_profile_id: studentProfile.id,
  academic_period_id: academicPeriod.id,
  status: 'active',
  effective_start_date: '2026-02-01',
}

export const teacherAssignment = {
  id: 'assignment-1',
  school_id: school.id,
  class_section_id: classSection.id,
  teacher_user_id: 'teacher-1',
  academic_period_id: academicPeriod.id,
  status: 'active',
  effective_start_date: '2026-02-01',
}

export function paginated(data = []) {
  return { data, meta: { page: 1, per_page: 25, total: data.length } }
}

export function axiosResponse(data) {
  return { data }
}

export function validationError(field = 'name') {
  return {
    response: {
      status: 422,
      data: { error: { code: 'validation_failed', details: { errors: { [field]: ['Required'] } } } },
      headers: { 'x-request-id': 'req-1' },
    },
  }
}
