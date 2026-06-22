export const ADMIN_SYSTEM_LAYOUT = 'admin-system'

export const SHELL_FEEDBACK_STATES = Object.freeze({
  loading: 'loading',
  empty: 'empty',
  error: 'error',
  forbidden: 'forbidden',
  unauthorized: 'unauthorized',
  sessionExpired: 'session-expired',
  tenantMismatch: 'tenant-mismatch',
  unavailable: 'unavailable',
})

export const SHELL_FEEDBACK_SEVERITY = Object.freeze({
  info: 'info',
  warning: 'warning',
  error: 'error',
})

export const shellFeedbackMessages = Object.freeze({
  [SHELL_FEEDBACK_STATES.loading]: {
    titleKey: 'feedback.loadingTitle',
    messageKey: 'feedback.loadingMessage',
    severity: SHELL_FEEDBACK_SEVERITY.info,
  },
  [SHELL_FEEDBACK_STATES.empty]: {
    titleKey: 'feedback.emptyTitle',
    messageKey: 'feedback.emptyMessage',
    severity: SHELL_FEEDBACK_SEVERITY.info,
  },
  [SHELL_FEEDBACK_STATES.error]: {
    titleKey: 'feedback.errorTitle',
    messageKey: 'feedback.errorMessage',
    severity: SHELL_FEEDBACK_SEVERITY.error,
  },
  [SHELL_FEEDBACK_STATES.forbidden]: {
    titleKey: 'feedback.forbiddenTitle',
    messageKey: 'feedback.forbiddenMessage',
    severity: SHELL_FEEDBACK_SEVERITY.warning,
  },
  [SHELL_FEEDBACK_STATES.unauthorized]: {
    titleKey: 'feedback.unauthorizedTitle',
    messageKey: 'feedback.unauthorizedMessage',
    severity: SHELL_FEEDBACK_SEVERITY.warning,
  },
  [SHELL_FEEDBACK_STATES.sessionExpired]: {
    titleKey: 'feedback.sessionExpiredTitle',
    messageKey: 'feedback.sessionExpiredMessage',
    severity: SHELL_FEEDBACK_SEVERITY.warning,
  },
  [SHELL_FEEDBACK_STATES.tenantMismatch]: {
    titleKey: 'feedback.tenantMismatchTitle',
    messageKey: 'feedback.tenantMismatchMessage',
    severity: SHELL_FEEDBACK_SEVERITY.error,
  },
  [SHELL_FEEDBACK_STATES.unavailable]: {
    titleKey: 'feedback.unavailableTitle',
    messageKey: 'feedback.unavailableMessage',
    severity: SHELL_FEEDBACK_SEVERITY.info,
  },
})

/**
 * @typedef {Object} ShellFeedbackState
 * @property {string} state
 * @property {string} titleKey
 * @property {string} messageKey
 * @property {'info'|'warning'|'error'} severity
 */

export function createShellFeedbackState(state) {
  const fallback = shellFeedbackMessages[SHELL_FEEDBACK_STATES.error]
  return {
    state,
    ...(shellFeedbackMessages[state] ?? fallback),
  }
}
