import { describe, expect, it } from 'vitest'
import { normalizeAuthError } from '@/services/auth/authErrorMapper'
import { normalizeAdministrationError } from '@/services/admin-system/administration-error-mapper'
import { normalizeAdvancedAssessmentError } from '@/services/assessments/advancedAssessmentErrorMapper'
import { normalizePlatformSupportError } from '@/services/platform-support/platformSupportErrorMapper'
import { normalizeReportingError } from '@/services/reporting/reportingErrorMapper'

function error(code, status) {
  return { response: { status, data: { error: { code } } } }
}

describe('System Administrator non-permission states', () => {
  it('keeps session, context, business, support, and file safety states distinct', () => {
    expect(normalizeAuthError(error('token_expired', 401)).feedback.state).toBe('expired-session')
    expect(normalizeAuthError(error('tenant_mismatch', 403)).feedback.state).toBe('tenant-mismatch')
    expect(normalizeAdministrationError(error('dependency_conflict', 409)).type).toBe('conflict')
    expect(normalizeReportingError(error('NO_ACTIVE_SCHOOL', 403)).type).toBe('no-active-school')
    expect(normalizePlatformSupportError(error('SUPPORT_ACCESS_EXPIRED', 410)).type).toBe('expired')
    expect(normalizeAdvancedAssessmentError(error('SCAN_PENDING', 423)).type).toBe('scan-pending')
    expect(normalizeAdvancedAssessmentError(error('AFTER_DUE_DATE', 410)).type).toBe('after-due-date')
  })
})
