import { isPresent, isValidEmail, mapCommonRecord } from './administration'

export function createUserForm() {
  return { fullName: '', email: '', roleIds: [] }
}

export function validateUserForm(form = {}) {
  const errors = {}

  if (!isPresent(form.fullName)) {
    errors.full_name = ['Full name is required.']
  }

  if (!isPresent(form.email)) {
    errors.email = ['Email is required.']
  } else if (!isValidEmail(form.email)) {
    errors.email = ['Enter a valid email address.']
  }

  if (!Array.isArray(form.roleIds) || form.roleIds.length === 0) {
    errors.role_ids = ['Select at least one role.']
  }

  return errors
}

export function mapUser(record) {
  return { ...mapCommonRecord(record), roles: Array.isArray(record.roles) ? record.roles : [] }
}

export function mapUserCreateRequest(form) {
  return { full_name: form.fullName, email: form.email, role_ids: [...form.roleIds] }
}

const USER_SORT_FIELDS = Object.freeze({
  fullName: 'full_name',
  email: 'email',
  status: 'status',
})

export function mapUserTableSort({ prop, order } = {}) {
  const field = USER_SORT_FIELDS[prop]
  if (!field || !order) return ''
  return order === 'descending' ? `-${field}` : field
}
