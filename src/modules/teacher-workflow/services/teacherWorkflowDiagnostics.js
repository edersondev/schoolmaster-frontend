const REDACTED = '[redacted]'
const SENSITIVE_KEY_PARTS = [
  'student',
  'teacher',
  'guardian',
  'token',
  'authorization',
  'bearer',
  'permission',
  'role',
  'path',
  'url',
  'file',
  'upload',
  'payload',
  'rows',
  'correction',
  'reason',
  'note',
  'tenant',
  'school',
  'cross',
]

function isSensitiveKey(key) {
  const normalized = String(key ?? '').toLowerCase()
  return SENSITIVE_KEY_PARTS.some((part) => normalized.includes(part))
}

export function redactTeacherWorkflowValue(value) {
  if (Array.isArray(value)) return value.map(redactTeacherWorkflowValue)
  if (!value || typeof value !== 'object') return value

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      isSensitiveKey(key) ? REDACTED : redactTeacherWorkflowValue(entry),
    ]),
  )
}

export function createSafeTeacherWorkflowDiagnostic(error, context = {}) {
  const headers = error?.response?.headers ?? {}
  return redactTeacherWorkflowValue({
    operationId: context.operationId ?? null,
    requestId: headers['x-request-id'] ?? headers['X-Request-Id'] ?? null,
    status: error?.response?.status ?? 0,
    code: error?.response?.data?.error?.code ?? error?.response?.data?.code ?? null,
    gate: error?.gate ?? null,
  })
}
