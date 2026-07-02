const REDACTED = '[redacted]'
const SENSITIVE_KEY_PARTS = [
  'student',
  'guardian',
  'token',
  'authorization',
  'bearer',
  'permission',
  'role',
  'path',
  'url',
  'file',
  'storage',
  'binary',
  'scan',
  'tenant',
  'school',
  'cross',
  'private',
  'teacher',
]

function isSensitiveKey(key) {
  const normalized = String(key ?? '').toLowerCase()
  return SENSITIVE_KEY_PARTS.some((part) => normalized.includes(part))
}

export function redactStudentSelfServiceValue(value) {
  if (Array.isArray(value)) return value.map(redactStudentSelfServiceValue)
  if (!value || typeof value !== 'object') return value

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      isSensitiveKey(key) ? REDACTED : redactStudentSelfServiceValue(entry),
    ]),
  )
}

export function createSafeStudentSelfServiceDiagnostic(error, context = {}) {
  const headers = error?.response?.headers ?? {}
  return redactStudentSelfServiceValue({
    operationId: context.operationId ?? null,
    requestId: headers['x-request-id'] ?? headers['X-Request-Id'] ?? null,
    status: error?.response?.status ?? 0,
    code: error?.response?.data?.error?.code ?? error?.response?.data?.code ?? null,
    gate: error?.gate ?? null,
    routeName: context.routeName ?? null,
  })
}
