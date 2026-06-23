export const DASHBOARD_PLACEHOLDER_STATES = Object.freeze({
  placeholder: 'placeholder',
  empty: 'empty',
  unavailable: 'unavailable',
  loading: 'loading',
  error: 'error',
  absent: 'absent',
})

export const dashboardSummaryCards = Object.freeze([
  {
    slotId: 'schools-overview',
    labelKey: 'dashboard.summary.schools',
    state: DASHBOARD_PLACEHOLDER_STATES.unavailable,
    dependencyKey: 'dashboard.dependencies.contractRequired',
  },
  {
    slotId: 'users-overview',
    labelKey: 'dashboard.summary.users',
    state: DASHBOARD_PLACEHOLDER_STATES.unavailable,
    dependencyKey: 'dashboard.dependencies.contractRequired',
  },
  {
    slotId: 'operations-overview',
    labelKey: 'dashboard.summary.operations',
    state: DASHBOARD_PLACEHOLDER_STATES.empty,
    dependencyKey: 'dashboard.dependencies.contractRequired',
  },
])

export const activityPlaceholder = Object.freeze({
  slotId: 'activity-placeholder',
  state: DASHBOARD_PLACEHOLDER_STATES.empty,
  titleKey: 'dashboard.activity.title',
  messageKey: 'dashboard.activity.empty',
})

export const dashboardNoticePlaceholder = Object.freeze({
  slotId: 'notice-placeholder',
  state: DASHBOARD_PLACEHOLDER_STATES.absent,
  titleKey: 'dashboard.notice.title',
  messageKey: 'dashboard.notice.absent',
})

const allowedPlaceholderKeys = new Set([
  'slotId',
  'labelKey',
  'titleKey',
  'messageKey',
  'state',
  'dependencyKey',
])

export function assertPlaceholderOnly(payload) {
  return Object.keys(payload).every((key) => allowedPlaceholderKeys.has(key))
}
