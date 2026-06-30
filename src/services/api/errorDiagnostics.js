const REDACTED = '[redacted]'
const SENSITIVE_KEY_PARTS = [
  'token',
  'password',
  'authorization',
  'bearer',
  'reason',
  'permission',
  'role',
  'tenant',
  'school',
  'secret',
]

function isSensitiveKey(key) {
  const normalized = String(key ?? '').toLowerCase()
  return SENSITIVE_KEY_PARTS.some((part) => normalized.includes(part))
}

export function sanitizeDiagnosticValue(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeDiagnosticValue)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [
        key,
        isSensitiveKey(key) ? REDACTED : sanitizeDiagnosticValue(entryValue),
      ]),
    )
  }

  return value
}

export function createSafeErrorDiagnostic(error, context = {}) {
  const headers = error?.response?.headers ?? {}

  return sanitizeDiagnosticValue({
    operationId: context.operationId ?? null,
    status: error?.response?.status ?? 0,
    code: error?.response?.data?.error?.code ?? null,
    requestId: headers['x-request-id'] ?? headers['X-Request-Id'] ?? null,
  })
}

