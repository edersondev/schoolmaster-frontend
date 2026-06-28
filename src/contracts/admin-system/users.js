import { isPresent, isValidEmail, mapCommonRecord } from './administration'

export function createUserForm() {
  return { fullName: '', email: '', status: 'active', roleIds: [] }
}

export function createUserDeleteForm(now = new Date()) {
  return {
    effectiveAt: formatDateInput(now),
    reason: '',
  }
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

export function validateUserDeleteForm(form = {}) {
  const errors = {}

  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(form.effectiveAt ?? ''))) {
    errors.effective_at = ['Effective date is required.']
  }

  const reason = String(form.reason ?? '').trim()
  if (!reason) {
    errors.reason = ['Reason is required.']
  } else if (reason.length > 500) {
    errors.reason = ['Reason must be 500 characters or fewer.']
  }

  return errors
}

export function mapUser(record) {
  return { ...mapCommonRecord(record), roles: Array.isArray(record.roles) ? record.roles : [] }
}

export function mapUserForm(record = {}) {
  return {
    ...createUserForm(),
    fullName: record.fullName ?? '',
    email: record.email ?? '',
    status: record.status ?? 'active',
    roleIds: Array.isArray(record.roles) ? record.roles.map((role) => role.id).filter(Boolean) : [],
  }
}

export function mapUserCreateRequest(form) {
  return { full_name: form.fullName, email: form.email, role_ids: [...form.roleIds] }
}

export function mapUserUpdateRequest(form) {
  return {
    full_name: form.fullName,
    email: form.email,
    status: form.status,
    role_ids: [...form.roleIds],
  }
}

export function mapUserDeleteRequest(form) {
  return {
    effective_at: String(form.effectiveAt ?? ''),
    reason: String(form.reason ?? '').trim(),
  }
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

function formatDateInput(value) {
  const date = value instanceof Date ? value : new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
