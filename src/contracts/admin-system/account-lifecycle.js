import {
  ACCOUNT_LIFECYCLE_FEEDBACK_STATES,
  createAccountLifecycleFeedbackState,
} from '@/contracts/auth/account-lifecycle'
import { isSystemAdministratorRole } from '@/contracts/auth/authSession.contract'

export const ACCOUNT_LIFECYCLE_OPERATION_IDS = Object.freeze({
  createInvitation: 'createAccountInvitation',
  completeInvitation: 'completeAccountInvitation',
  requestPasswordReset: 'requestPasswordReset',
  completePasswordReset: 'completePasswordReset',
  getLock: 'getAccountLock',
  lock: 'lockAccount',
  unlock: 'unlockAccount',
  reactivate: 'reactivateAccount',
  resendInvitation: 'resendAccountInvitation',
  requestPasswordDelivery: 'requestUserPasswordDelivery',
})

export const ACCOUNT_LIFECYCLE_ACTIONS = Object.freeze({
  lock: 'lock',
  unlock: 'unlock',
  recover: 'recover',
  reactivate: 'reactivate',
})

export const ACCOUNT_LIFECYCLE_API_ACTIONS = Object.freeze({
  recover: 'unlock',
  reactivate: 'reactivate',
})

export const ACCOUNT_LIFECYCLE_PERMISSION_SOURCE_CONFIRMED = true

export const ACCOUNT_LIFECYCLE_PERMISSIONS = Object.freeze({
  manage: 'account_lifecycle.manage',
})

export const BLOCKED_ADMIN_INVITATION_RESEND = Object.freeze({
  blocked: true,
  operationId: ACCOUNT_LIFECYCLE_OPERATION_IDS.resendInvitation,
  reason: 'token-path-contract',
  messageKey: 'accountLifecycle.invitation.resendBlocked',
})

/**
 * @typedef {Object} AccountLockView
 * @property {string|null} id
 * @property {string|null} userId
 * @property {string|null} schoolId
 * @property {string|null} lockType
 * @property {string} status
 * @property {string|null} reason
 * @property {string|null} lockedAt
 * @property {string|null} clearedAt
 */

/**
 * @typedef {Object} AccountLifecycleActionDraft
 * @property {string} targetUserId
 * @property {string} action
 * @property {string} reason
 * @property {boolean} pending
 * @property {Object<string,string[]>} validationErrors
 * @property {Object|null} feedbackState
 * @property {Object} eligibility
 */

function firstValue(record = {}, snakeKey, camelKey, fallback = null) {
  return record[snakeKey] ?? record[camelKey] ?? fallback
}

function compact(record) {
  return Object.fromEntries(
    Object.entries(record).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  )
}

export function mapAccountInvitationCreateRequest(form = {}) {
  return compact({
    scope: String(form.scope ?? ''),
    school_id: form.schoolId ?? form.school_id ?? null,
    full_name: String(form.fullName ?? form.full_name ?? '').trim(),
    email: String(form.email ?? '').trim(),
    role_ids: Array.isArray(form.roleIds) ? [...form.roleIds] : (form.role_ids ?? []),
  })
}

export function mapAccountLock(data = {}) {
  return {
    id: data.id ?? null,
    userId: firstValue(data, 'user_id', 'userId'),
    schoolId: firstValue(data, 'school_id', 'schoolId'),
    lockType: firstValue(data, 'lock_type', 'lockType'),
    status: data.status ?? 'none',
    reason: data.reason ?? null,
    lockedAt: firstValue(data, 'locked_at', 'lockedAt'),
    clearedAt: firstValue(data, 'cleared_at', 'clearedAt'),
  }
}

export function mapAccountLifecycleActionRequest({ action, reason } = {}) {
  if (action === ACCOUNT_LIFECYCLE_ACTIONS.lock) {
    return { reason: String(reason ?? '').trim() }
  }
  if (action === ACCOUNT_LIFECYCLE_ACTIONS.unlock) {
    return undefined
  }

  return compact({
    action: ACCOUNT_LIFECYCLE_API_ACTIONS[action],
    reason: String(reason ?? '').trim(),
  })
}

export function mapAdminAccountLifecycleResult(data = {}) {
  return {
    userId: firstValue(data, 'user_id', 'userId'),
    schoolId: firstValue(data, 'school_id', 'schoolId'),
    status: data.status ?? null,
    action: data.action ?? null,
  }
}

export function mapPasswordDeliveryRequestResult(data = {}) {
  const deliveryChannel = firstValue(data, 'delivery_channel', 'deliveryChannel')

  return {
    status: data.status === 'requested' ? 'requested' : null,
    deliveryChannel: deliveryChannel === 'email' ? 'email' : null,
    deliveryRequestedAt: firstValue(data, 'delivery_requested_at', 'deliveryRequestedAt'),
  }
}

export function validateAccountLifecycleAction({ action, reason } = {}) {
  const errors = {}
  const trimmedReason = String(reason ?? '').trim()

  if (action === ACCOUNT_LIFECYCLE_ACTIONS.lock && !trimmedReason) {
    errors.reason = ['Reason is required.']
  }

  if (trimmedReason.length > 500) {
    errors.reason = ['Reason must be 500 characters or fewer.']
  }

  return errors
}

export function hasAccountLifecycleAuthority({ permissions = [], roles = [], scope } = {}) {
  if (roles.some(isSystemAdministratorRole)) return true

  return permissions.some(
    (permission) =>
      permission?.code === ACCOUNT_LIFECYCLE_PERMISSIONS.manage &&
      permission?.scope === scope &&
      permission?.status === 'active',
  )
}

export function deriveAccountLifecycleEligibility({
  actorId = null,
  target = null,
  lock = null,
  permissions = [],
  roles = [],
  schoolId = null,
} = {}) {
  const sourceConfirmed = ACCOUNT_LIFECYCLE_PERMISSION_SOURCE_CONFIRMED
  const targetSchoolId = target?.schoolId ?? target?.school_id ?? null
  const scope = targetSchoolId ? 'school' : 'platform'
  const isMaster = roles.some(isSystemAdministratorRole)
  const hasAuthority = hasAccountLifecycleAuthority({ permissions, roles, scope })
  const schoolReady = scope === 'platform' || (Boolean(schoolId) && schoolId === targetSchoolId)
  const selfTarget = Boolean(actorId && target?.id && actorId === target.id)
  const targetAvailable = Boolean(target?.id) && !target?.deletedAt && !target?.deleted_at
  const blocked =
    !sourceConfirmed || !hasAuthority || !targetAvailable || !schoolReady || selfTarget
  const lockStatus = lock?.status ?? 'none'
  const targetStatus = target?.status ?? ''
  const activeTarget = targetStatus === 'active'
  const inactiveTarget = targetStatus === 'inactive'
  const invitedTarget = targetStatus === 'invited'

  return {
    sourceConfirmed,
    scope,
    isMaster,
    hasAuthority,
    schoolReady,
    selfTarget,
    blocked,
    canReviewLock: !blocked && !invitedTarget,
    canInvite: !blocked && invitedTarget,
    canDeliverPassword: !blocked && activeTarget && lockStatus !== 'active',
    canLock: !blocked && activeTarget && lockStatus !== 'active',
    canUnlock: !blocked && activeTarget && lockStatus === 'active',
    canRecover: !blocked && activeTarget && lockStatus === 'active',
    canReactivate: !blocked && inactiveTarget && lockStatus !== 'active',
    feedback: blocked
      ? createAccountLifecycleFeedbackState(ACCOUNT_LIFECYCLE_FEEDBACK_STATES.forbidden, {
          messageKey: 'feedback.permissionSourceBlocked',
        })
      : null,
  }
}
