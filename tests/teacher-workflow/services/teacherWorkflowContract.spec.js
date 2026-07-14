import { describe, expect, it } from 'vitest'
import {
  TEACHER_WORKFLOW_CAPABILITIES,
  hasCapability,
} from '@/modules/teacher-workflow/services/teacherWorkflowContract'

describe('teacherWorkflowContract capabilities', () => {
  it('honors wildcard permissions for teacher workflow checks', () => {
    expect(hasCapability({ permissions: ['*'] }, TEACHER_WORKFLOW_CAPABILITIES.adminImport)).toBe(true)
    expect(
      hasCapability(
        { permissions: [{ code: '*', status: 'active' }] },
        TEACHER_WORKFLOW_CAPABILITIES.adminImport,
      ),
    ).toBe(true)
  })

  it('honors privileged platform roles for teacher workflow checks', () => {
    expect(
      hasCapability(
        {
          roles: [{ name: 'System Administrator', scope: 'platform', status: 'active' }],
          permissions: [],
        },
        TEACHER_WORKFLOW_CAPABILITIES.adminImport,
      ),
    ).toBe(true)
  })
})
