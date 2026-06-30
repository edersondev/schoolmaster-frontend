import { describe, expect, it } from 'vitest'
import { createStudentEnrollmentRosterDiagnostic } from '@/services/admin-system/studentEnrollmentRosterErrorMapper'

describe('student enrollment roster diagnostics', () => {
  it('does not include sensitive payload values', () => {
    const diagnostic = createStudentEnrollmentRosterDiagnostic({ response: { status: 403, data: { error: { code: 'tenant_mismatch', payload: { token: 'secret', reason: 'private' } } } } }, { operationId: 'x' })
    expect(JSON.stringify(diagnostic)).not.toContain('secret')
    expect(JSON.stringify(diagnostic)).not.toContain('private')
  })
})
