import { describe, expect, it } from 'vitest'
import { studentRoutes } from '@/router/modules/student'
import { STUDENT_SELF_SERVICE_ROUTE_NAMES } from '@/contracts/student/studentSelfServiceContract'

describe('student self-service routes', () => {
  it('registers protected student workspace routes with default Assigned Learning Sets landing', () => {
    const names = studentRoutes.map((route) => route.name)
    expect(names).toContain(STUDENT_SELF_SERVICE_ROUTE_NAMES.workspace)
    expect(studentRoutes[0].redirect).toEqual({
      name: STUDENT_SELF_SERVICE_ROUTE_NAMES.assignedLearningSets,
    })
    expect(names).toEqual(
      expect.arrayContaining([
        STUDENT_SELF_SERVICE_ROUTE_NAMES.assignedLearningSets,
        STUDENT_SELF_SERVICE_ROUTE_NAMES.learningSetDetail,
        STUDENT_SELF_SERVICE_ROUTE_NAMES.grades,
        STUDENT_SELF_SERVICE_ROUTE_NAMES.gradeDetail,
        STUDENT_SELF_SERVICE_ROUTE_NAMES.attendance,
        STUDENT_SELF_SERVICE_ROUTE_NAMES.attendanceDetail,
        STUDENT_SELF_SERVICE_ROUTE_NAMES.overview,
      ]),
    )
    expect(studentRoutes.every((route) => route.meta.requiresAuth && route.meta.requiresSchoolContext)).toBe(true)
  })
})
