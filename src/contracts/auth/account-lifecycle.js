export const ACCOUNT_LIFECYCLE_FEEDBACK_STATES = Object.freeze({
  loading: 'loading',
  validation: 'validation',
  neutralConfirmation: 'neutral-confirmation',
  invalidToken: 'invalid-token',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  tenantMismatch: 'tenant-mismatch',
  inactiveSchool: 'inactive-school',
  notFound: 'not-found',
  conflict: 'conflict',
  temporaryUnavailable: 'temporary-unavailable',
  success: 'success',
})

export const ACCOUNT_LIFECYCLE_RECOVERY_ACTIONS = Object.freeze({
  signIn: 'sign-in',
  chooseSchool: 'choose-school',
  allowedWorkspace: 'allowed-workspace',
  retry: 'retry',
  requestReset: 'request-reset',
  none: null,
})

const FEEDBACK_META = Object.freeze({
  [ACCOUNT_LIFECYCLE_FEEDBACK_STATES.loading]: {
    severity: 'info',
    messageKey: 'feedback.loading',
  },
  [ACCOUNT_LIFECYCLE_FEEDBACK_STATES.validation]: {
    severity: 'error',
    messageKey: 'feedback.validation',
  },
  [ACCOUNT_LIFECYCLE_FEEDBACK_STATES.neutralConfirmation]: {
    severity: 'info',
    messageKey: 'feedback.neutralConfirmation',
  },
  [ACCOUNT_LIFECYCLE_FEEDBACK_STATES.invalidToken]: {
    severity: 'warning',
    messageKey: 'feedback.invalidToken',
    recoveryAction: ACCOUNT_LIFECYCLE_RECOVERY_ACTIONS.requestReset,
  },
  [ACCOUNT_LIFECYCLE_FEEDBACK_STATES.unauthorized]: {
    severity: 'error',
    messageKey: 'feedback.unauthorized',
    recoveryAction: ACCOUNT_LIFECYCLE_RECOVERY_ACTIONS.signIn,
  },
  [ACCOUNT_LIFECYCLE_FEEDBACK_STATES.forbidden]: {
    severity: 'error',
    messageKey: 'feedback.forbidden',
    recoveryAction: ACCOUNT_LIFECYCLE_RECOVERY_ACTIONS.allowedWorkspace,
  },
  [ACCOUNT_LIFECYCLE_FEEDBACK_STATES.tenantMismatch]: {
    severity: 'error',
    messageKey: 'feedback.tenantMismatch',
    recoveryAction: ACCOUNT_LIFECYCLE_RECOVERY_ACTIONS.chooseSchool,
  },
  [ACCOUNT_LIFECYCLE_FEEDBACK_STATES.inactiveSchool]: {
    severity: 'error',
    messageKey: 'feedback.inactiveSchool',
    recoveryAction: ACCOUNT_LIFECYCLE_RECOVERY_ACTIONS.chooseSchool,
  },
  [ACCOUNT_LIFECYCLE_FEEDBACK_STATES.notFound]: {
    severity: 'warning',
    messageKey: 'feedback.notFound',
    recoveryAction: ACCOUNT_LIFECYCLE_RECOVERY_ACTIONS.allowedWorkspace,
  },
  [ACCOUNT_LIFECYCLE_FEEDBACK_STATES.conflict]: {
    severity: 'warning',
    messageKey: 'feedback.conflict',
  },
  [ACCOUNT_LIFECYCLE_FEEDBACK_STATES.temporaryUnavailable]: {
    severity: 'error',
    messageKey: 'feedback.temporaryUnavailable',
    recoveryAction: ACCOUNT_LIFECYCLE_RECOVERY_ACTIONS.retry,
  },
  [ACCOUNT_LIFECYCLE_FEEDBACK_STATES.success]: {
    severity: 'success',
    messageKey: 'feedback.success',
    recoveryAction: ACCOUNT_LIFECYCLE_RECOVERY_ACTIONS.signIn,
  },
})

/**
 * @typedef {Object} AccountInvitationView
 * @property {string|null} id
 * @property {string|null} userId
 * @property {string|null} schoolId
 * @property {string} scope
 * @property {string} status
 * @property {string|null} expiresAt
 * @property {string|null} completedAt
 * @property {string|null} deliveryChannel
 * @property {string|null} deliveryRequestedAt
 */

/**
 * @typedef {Object} InvitationSetupDraft
 * @property {string} invitationToken
 * @property {string} password
 * @property {Object<string,string[]>} validationErrors
 * @property {boolean} pending
 * @property {SafeFeedbackState|null} feedbackState
 */

/**
 * @typedef {Object} PasswordResetRequestDraft
 * @property {string} email
 * @property {Object<string,string[]>} validationErrors
 * @property {boolean} pending
 * @property {SafeFeedbackState|null} feedbackState
 */

/**
 * @typedef {Object} PasswordResetCompletionDraft
 * @property {string} resetToken
 * @property {string} password
 * @property {Object<string,string[]>} validationErrors
 * @property {boolean} pending
 * @property {SafeFeedbackState|null} feedbackState
 */

/**
 * @typedef {Object} AccountLifecycleResultView
 * @property {string|null} userId
 * @property {string|null} schoolId
 * @property {string|null} status
 * @property {string|null} action
 */

/**
 * @typedef {Object} SafeFeedbackState
 * @property {string} state
 * @property {string} severity
 * @property {string} messageKey
 * @property {string|null} recoveryAction
 */

function firstValue(record = {}, snakeKey, camelKey, fallback = null) {
  return record[snakeKey] ?? record[camelKey] ?? fallback
}

export function createAccountLifecycleFeedbackState(state, options = {}) {
  const meta =
    FEEDBACK_META[state] ?? FEEDBACK_META[ACCOUNT_LIFECYCLE_FEEDBACK_STATES.temporaryUnavailable]

  return {
    state,
    severity: options.severity ?? meta.severity,
    messageKey: options.messageKey ?? meta.messageKey,
    recoveryAction: options.recoveryAction ?? meta.recoveryAction ?? null,
  }
}

export function mapAccountInvitation(data = {}) {
  return {
    id: data.id ?? null,
    userId: firstValue(data, 'user_id', 'userId'),
    schoolId: firstValue(data, 'school_id', 'schoolId'),
    scope: data.scope ?? '',
    status: data.status ?? 'pending',
    expiresAt: firstValue(data, 'expires_at', 'expiresAt'),
    completedAt: firstValue(data, 'completed_at', 'completedAt'),
    deliveryChannel: firstValue(data, 'delivery_channel', 'deliveryChannel'),
    deliveryRequestedAt: firstValue(data, 'delivery_requested_at', 'deliveryRequestedAt'),
  }
}

export function mapAccountLifecycleResult(data = {}) {
  return {
    userId: firstValue(data, 'user_id', 'userId'),
    schoolId: firstValue(data, 'school_id', 'schoolId'),
    status: data.status ?? null,
    action: data.action ?? null,
  }
}

export function mapInvitationSetupRequest(input = {}) {
  return {
    password: String(input.password ?? ''),
  }
}

export function mapPasswordResetRequest(input = {}) {
  return {
    email: String(input.email ?? '').trim(),
  }
}

export function mapPasswordResetCompletionRequest(input = {}) {
  return {
    token: String(input.token ?? input.resetToken ?? '').trim(),
    password: String(input.password ?? ''),
  }
}

export function validateLifecyclePassword(password) {
  const value = String(password ?? '')
  const errors = []

  if (!value) {
    errors.push('Password is required.')
  } else if (value.length < 12) {
    errors.push('Use at least 12 characters.')
  } else if (value.length > 128) {
    errors.push('Use 128 characters or fewer.')
  }

  return errors
}

export function isMalformedLifecycleToken(token) {
  const value = String(token ?? '').trim()
  return value.length < 32 || value.length > 255 || /\s/.test(value)
}

