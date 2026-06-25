import { mapCommonRecord } from './administration'

export function createRoleForm() {
  return { name: '', permissionIds: [] }
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
