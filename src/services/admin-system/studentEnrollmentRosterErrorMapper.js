import { normalizeAdministrationError } from './administration-error-mapper'
import { createSafeErrorDiagnostic, sanitizeDiagnosticValue } from '@/services/api/errorDiagnostics'

const TYPE_ALIASES = Object.freeze({
  unavailable: 'temporary-unavailable',
  'inactive-context': 'inactive-school',
})

export function normalizeStudentEnrollmentRosterError(error, context = {}) {
  const normalized = normalizeAdministrationError(error, context)
  return {
    ...normalized,
    type: TYPE_ALIASES[normalized.type] ?? normalized.type,
    diagnostic: createStudentEnrollmentRosterDiagnostic(error, context),
  }
}

export function createStudentEnrollmentRosterDiagnostic(error, context = {}) {
  return sanitizeDiagnosticValue(
    createSafeErrorDiagnostic(error, {
      operationId: context.operationId,
      routeName: context.routeName,
    }),
  )
}
