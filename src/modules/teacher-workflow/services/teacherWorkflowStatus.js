export const WORKFLOW_STATUSES = Object.freeze({
  active: 'active',
  inactive: 'inactive',
  deleted: 'deleted',
  restored: 'restored',
  unavailable: 'unavailable',
  readOnlyLegacy: 'read-only-legacy',
})

export const SCAN_STATUSES = Object.freeze({
  pending: 'pending',
  clean: 'clean',
  failed: 'failed',
  unavailable: 'unavailable',
})

export function statusLabel(status) {
  return String(status || 'unknown')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function statusType(status) {
  if (['active', 'clean', 'success'].includes(status)) return 'success'
  if (['inactive', 'pending', 'restored', 'read-only-legacy'].includes(status)) return 'warning'
  if (['deleted', 'failed', 'unavailable', 'conflict'].includes(status)) return 'danger'
  return 'info'
}

export function canDownloadContent(item) {
  return item?.downloadAvailable === true && item?.scanStatus === 'clean' && item?.status === 'active'
}

export function canUseActiveRecord(record) {
  return record?.status === 'active'
}

export function restoreTargetStatus() {
  return WORKFLOW_STATUSES.inactive
}
