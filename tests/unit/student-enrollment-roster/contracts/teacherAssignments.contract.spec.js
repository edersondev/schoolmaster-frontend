import { describe, expect, it } from 'vitest'
import {
  TEACHER_ASSIGNMENT_SCOPE,
  createTeacherAssignmentDeactivateDraft,
  createTeacherAssignmentDraft,
  mapTeacherAssignment,
  mapTeacherAssignmentCreateRequest,
  mapTeacherAssignmentStatusRequest,
} from '@/contracts/admin-system/teacher-assignments'
import { teacherAssignment } from '../fixtures/studentEnrollmentRoster.fixtures'

describe('teacher assignment contract', () => {
  it('keeps admin-only and deferred route metadata', () => {
    expect(TEACHER_ASSIGNMENT_SCOPE.adminOnly).toBe('admin-only')
    expect(TEACHER_ASSIGNMENT_SCOPE.teacherRouteDeferred).toBeTruthy()
    expect(mapTeacherAssignment(teacherAssignment)).toMatchObject({ id: 'assignment-1', academicPeriodId: 'period-1' })
  })

  it('projects create/deactivate payloads', () => {
    expect(mapTeacherAssignmentCreateRequest(createTeacherAssignmentDraft({ classSectionId: 'c1', teacherUserId: 'u1', academicPeriodId: 'p1', effectiveStartDate: '2026-01-01' }))).toEqual({ class_section_id: 'c1', teacher_user_id: 'u1', academic_period_id: 'p1', effective_start_date: '2026-01-01' })
    expect(mapTeacherAssignmentStatusRequest(createTeacherAssignmentDeactivateDraft({ effectiveEndDate: '2026-02-01', reason: 'done' }))).toEqual({ status: 'inactive', effective_end_date: '2026-02-01', reason: 'done' })
  })
})
