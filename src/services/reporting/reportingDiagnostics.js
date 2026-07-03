const REDACTED = '[redacted]'
const SENSITIVE_KEY_PARTS = [
  'filter',
  'payload',
  'content',
  'storage',
  'path',
  'key',
  'school',
  'tenant',
  'cross',
  'token',
  'authorization',
  'bearer',
  'permission',
  'role',
  'private',
  'hidden',
  'credential',
  'report',
]

function isSensitiveKey(key) {
  const normalized = String(key ?? '').toLowerCase()
  return SENSITIVE_KEY_PARTS.some((part) => normalized.includes(part))
}

export function redactReportingValue(value) {
  if (Array.isArray(value)) return value.map(redactReportingValue)
  if (!value || typeof value !== 'object') return value

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      isSensitiveKey(key) ? REDACTED : redactReportingValue(entry),
    ]),
  )
}

export function createSafeReportingDiagnostic(error, context = {}) {
  const headers = error?.response?.headers ?? {}
  return redactReportingValue({
    operationId: context.operationId ?? null,
    requestId: headers['x-request-id'] ?? headers['X-Request-Id'] ?? null,
    status: error?.response?.status ?? 0,
    code: error?.response?.data?.error?.code ?? error?.response?.data?.code ?? null,
    gate: error?.gate ?? null,
    routeName: context.routeName ?? null,
  })
}
