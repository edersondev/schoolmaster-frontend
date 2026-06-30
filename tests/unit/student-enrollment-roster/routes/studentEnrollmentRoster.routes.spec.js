import { describe, expect, it } from 'vitest'
import { accessAdministrationRoutes } from '@/router/modules/access-administration.routes'

describe('student enrollment roster routes', () => {
  it('registers protected admin-only routes and omits blocked routes', () => {
    const names = accessAdministrationRoutes.map((route) => route.name)
    expect(names).toContain('studentProfilesList')
    expect(names).toContain('classSectionsList')
    expect(names).toContain('teacherAssignmentsList')
    expect(names).not.toContain('teacherOwnAssignmentsList')
    expect(names).not.toContain('classSectionTeacherAssignmentsList')
  })
})
