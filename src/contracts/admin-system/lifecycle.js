export const LIFECYCLE_ACTIONS = Object.freeze({
  activate: 'activate',
  deactivate: 'deactivate',
  delete: 'delete',
  restore: 'restore',
})

export const LIFECYCLE_BULK_LIMIT = 50

export const LIFECYCLE_STATUS_CATEGORIES = Object.freeze({
  active: ['active'],
  inactive: ['inactive', 'disabled'],
  deleted: ['deleted', 'archived', 'trashed'],
  pending: ['pending'],
})

export const LIFECYCLE_OPERATION_REGISTRY = Object.freeze({
  schools: {
    detail: 'getSchool',
    update: 'updateSchool',
    activate: 'activateSchool',
    deactivate: 'deactivateSchool',
    delete: 'deleteSchool',
    restore: 'restoreSchool',
  },
  users: {
    detail: 'getUser',
    update: 'updateUser',
    activate: 'activateUser',
    deactivate: 'deactivateUser',
    delete: 'deleteUser',
    restore: 'restoreUser',
    bulk: 'bulkLifecycleUsers',
  },
  roles: {
    detail: 'getRole',
    update: 'updateRole',
    activate: 'activateRole',
    deactivate: 'deactivateRole',
    delete: 'deleteRole',
    restore: 'restoreRole',
    bulk: 'bulkLifecycleRoles',
  },
  academicYears: {
    detail: 'getAcademicYear',
    update: 'updateAcademicYear',
    activate: 'activateAcademicYear',
    deactivate: 'deactivateAcademicYear',
    delete: 'deleteAcademicYear',
    restore: 'restoreAcademicYear',
    bulk: 'bulkLifecycleAcademicYears',
  },
  academicPeriods: {
    detail: 'getAcademicPeriod',
    update: 'updateAcademicPeriod',
    activate: 'activateAcademicPeriod',
    deactivate: 'deactivateAcademicPeriod',
    delete: 'deleteAcademicPeriod',
    restore: 'restoreAcademicPeriod',
    bulk: 'bulkLifecycleAcademicPeriods',
  },
  guardians: {
    detail: 'getGuardian',
    update: 'updateGuardian',
    activate: 'activateGuardian',
    deactivate: 'deactivateGuardian',
    delete: 'deleteGuardian',
    restore: 'restoreGuardian',
    bulk: 'bulkLifecycleGuardians',
  },
  permissions: {
    detail: null,
    update: null,
  },
})

export const LIFECYCLE_RESOURCE_CAPABILITIES = Object.freeze({
  schools: {
    resource: 'schools',
    bulk: false,
    schoolContext: false,
    viewPermissions: ['schools.view'],
    managePermissions: ['schools.view', 'schools.manage'],
    updatePermissions: ['schools.view', 'schools.manage'],
    actions: Object.values(LIFECYCLE_ACTIONS),
  },
  users: {
    resource: 'users',
    bulk: true,
    schoolContext: true,
    viewPermissions: ['users.view'],
    managePermissions: ['users.view', 'users.manage'],
    updatePermissions: ['users.view', 'users.manage', 'roles.view'],
    actions: Object.values(LIFECYCLE_ACTIONS),
  },
  roles: {
    resource: 'roles',
    bulk: true,
    schoolContext: true,
    viewPermissions: ['roles.view'],
    managePermissions: ['roles.view', 'roles.manage'],
    updatePermissions: ['roles.view', 'roles.manage', 'permissions.view'],
    actions: Object.values(LIFECYCLE_ACTIONS),
  },
  academicYears: {
    resource: 'academicYears',
    bulk: true,
    schoolContext: true,
    viewPermissions: ['academic_years.view'],
    managePermissions: ['academic_years.view', 'academic_years.manage'],
    updatePermissions: ['academic_years.view', 'academic_years.manage'],
    actions: Object.values(LIFECYCLE_ACTIONS),
  },
  academicPeriods: {
    resource: 'academicPeriods',
    bulk: true,
    schoolContext: true,
    viewPermissions: ['academic_periods.view'],
    managePermissions: ['academic_periods.view', 'academic_periods.manage'],
    updatePermissions: ['academic_periods.view', 'academic_periods.manage'],
    actions: Object.values(LIFECYCLE_ACTIONS),
  },
  guardians: {
    resource: 'guardians',
    bulk: true,
    schoolContext: true,
    viewPermissions: ['guardians.view'],
    managePermissions: ['guardians.view', 'guardians.manage'],
    updatePermissions: ['guardians.view', 'guardians.manage'],
    actions: Object.values(LIFECYCLE_ACTIONS),
  },
  permissions: {
    resource: 'permissions',
    bulk: false,
    schoolContext: true,
    viewPermissions: ['permissions.view'],
    managePermissions: [],
    updatePermissions: [],
    actions: [],
  },
})

export const LIFECYCLE_UPDATE_FIELD_ALLOWLISTS = Object.freeze({
  schools: ['name', 'contact_email', 'contact_phone', 'address'],
  users: ['full_name', 'email', 'role_ids'],
  roles: ['name', 'permission_ids'],
  academicYears: ['name', 'start_date', 'end_date'],
  academicPeriods: ['name', 'sequence', 'start_date', 'end_date'],
  guardians: ['full_name', 'relationship_type', 'contact_email', 'contact_phone'],
})

export function getLifecycleCapability(resource) {
  return LIFECYCLE_RESOURCE_CAPABILITIES[resource] ?? null
}

export function getLifecycleOperations(resource) {
  return LIFECYCLE_OPERATION_REGISTRY[resource] ?? {}
}

export function getStatusCategory(status) {
  const normalized = String(status ?? '').toLowerCase()
  return (
    Object.entries(LIFECYCLE_STATUS_CATEGORIES).find(([, values]) =>
      values.includes(normalized),
    )?.[0] ?? 'unknown'
  )
}

export function projectUpdatePayload(payload = {}, resource) {
  const allowlist = LIFECYCLE_UPDATE_FIELD_ALLOWLISTS[resource] ?? []
  return Object.fromEntries(
    Object.entries(payload).filter((entry) => allowlist.includes(entry[0])),
  )
}

export function mapLifecycleActionRequest(form = {}) {
  return {
    effective_at: String(form.effectiveAt ?? form.effective_at ?? ''),
    reason: String(form.reason ?? '').trim(),
  }
}

export function mapBulkLifecycleRequest({ action, ids = [], effectiveAt, reason } = {}) {
  return {
    action,
    ids: [...new Set(ids)].slice(0, LIFECYCLE_BULK_LIMIT),
    effective_at: String(effectiveAt ?? ''),
    reason: String(reason ?? '').trim(),
  }
}

export function validateLifecycleActionForm(form = {}, now = new Date()) {
  const errors = {}
  const effectiveAt = String(form.effectiveAt ?? form.effective_at ?? '')
  const reason = String(form.reason ?? '').trim()

  if (!/^\d{4}-\d{2}-\d{2}$/.test(effectiveAt)) {
    errors.effective_at = ['Effective date is required.']
  } else if (effectiveAt > formatDateInput(now)) {
    errors.effective_at = ['Effective date must be today or in the past.']
  }

  if (!reason) {
    errors.reason = ['Reason is required.']
  } else if (reason.length > 500) {
    errors.reason = ['Reason must be 500 characters or fewer.']
  }

  return errors
}

export function mapLifecycleOutcome(envelope = {}) {
  const data = envelope.data ?? envelope
  return {
    resourceType: data.resource_type ?? data.resourceType ?? null,
    resourceId: data.resource_id ?? data.resourceId ?? null,
    action: data.action ?? null,
    status: data.status ?? null,
    affectedIds: data.affected_ids ?? data.affectedIds ?? [],
    lifecycleHistory: data.lifecycle_history ?? data.lifecycleHistory ?? [],
  }
}

export function formatDateInput(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
