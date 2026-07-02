const REDACTED = '[redacted]'
const SENSITIVE_KEY_PARTS = [
  'student',
  'guardian',
  'contact',
  'token',
  'authorization',
  'bearer',
  'permission',
  'role',
  'path',
  'url',
  'file',
  'storage',
  'tenant',
  'school',
  'cross',
  'private',
  'teacher',
  'report',
  'correction',
  'legal',
  'custody',
]

function isSensitiveKey(key) {
  const normalized = String(key ?? '').toLowerCase()
  return SENSITIVE_KEY_PARTS.some((part) => normalized.includes(part))
}

export function redactGuardianSelfServiceValue(value) {
  if (Array.isArray(value)) return value.map(redactGuardianSelfServiceValue)
  if (!value || typeof value !== 'object') return value

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      isSensitiveKey(key) ? REDACTED : redactGuardianSelfServiceValue(entry),
    ]),
  )
}

export function createSafeGuardianSelfServiceDiagnostic(error, context = {}) {
  const headers = error?.response?.headers ?? {}
  return redactGuardianSelfServiceValue({
    operationId: context.operationId ?? null,
    requestId: headers['x-request-id'] ?? headers['X-Request-Id'] ?? null,
    status: error?.response?.status ?? 0,
    code: error?.response?.data?.error?.code ?? error?.response?.data?.code ?? null,
    gate: error?.gate ?? null,
    routeName: context.routeName ?? null,
  })
}
