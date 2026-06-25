import { mapCommonRecord } from './administration'

export function createUserForm() {
  return { fullName: '', email: '', roleIds: [] }
}

export function mapUser(record) {
  return { ...mapCommonRecord(record), roles: Array.isArray(record.roles) ? record.roles : [] }
}

export function mapUserCreateRequest(form) {
  return { full_name: form.fullName, email: form.email, role_ids: [...form.roleIds] }
}
