import { describe, expect, it } from 'vitest'
import { normalizeStudentEnrollmentRosterError } from '@/services/admin-system/studentEnrollmentRosterErrorMapper'
import { validationError } from '../fixtures/studentEnrollmentRoster.fixtures'

describe('student enrollment roster error mapper', () => {
  it('normalizes validation and redacts diagnostics', () => {
    const error = normalizeStudentEnrollmentRosterError(validationError('reason'), { operationId: 'transferStudentProfile' })
    expect(error.type).toBe('validation')
    expect(error.fieldErrors.reason).toEqual(['Required'])
    expect(error.diagnostic.operationId).toBe('transferStudentProfile')
  })
})
