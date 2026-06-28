import { isPresent, mapCommonRecord } from './administration'

export function createRoleForm() {
  return { name: '', permissionIds: [] }
}

export function validateRoleForm(form = {}) {
  const errors = {}

  if (!isPresent(form.name)) {
    errors.name = ['Role name is required.']
  }

  if (!Array.isArray(form.permissionIds) || form.permissionIds.length === 0) {
    errors.permission_ids = ['Select at least one permission.']
  }

  return errors
}

export function mapPermission(record) {
  return mapCommonRecord(record)
}

export function mapRole(record) {
  return {
    ...mapCommonRecord(record),
    permissions: Array.isArray(record.permissions) ? record.permissions.map(mapPermission) : [],
  }
}

export function mapRoleCreateRequest(form) {
  return { scope: 'school', name: form.name, permission_ids: [...form.permissionIds] }
}

export function isSchoolPermission(permission) {
  return permission.scope === 'school' && permission.status === 'active'
}
