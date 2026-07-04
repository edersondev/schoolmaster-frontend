import { createI18n } from 'vue-i18n'
import ElementPlus from 'element-plus'
import { createPinia, setActivePinia } from 'pinia'
import { vi } from 'vitest'
import { authMessages } from '@/locales/auth'
import { accountLifecycleMessages } from '@/locales/account-lifecycle'

export const school = Object.freeze({
  id: '20000000-0000-4000-8000-000000000001',
  name: 'Northfield Academy',
  cnpj: '56563930000108',
  status: 'active',
  time_zone: 'America/Sao_Paulo',
})

export const permission = Object.freeze({
  id: '30000000-0000-4000-8000-000000000001',
  code: 'admin.dashboard.view',
  name: 'View dashboard',
  scope: 'platform',
  status: 'active',
})

export const role = Object.freeze({
  id: '40000000-0000-4000-8000-000000000001',
  school_id: null,
  scope: 'platform',
  name: 'System Administrator',
  status: 'active',
  permissions: [permission],
})

export const authSessionEnvelope = Object.freeze({
  data: {
    token: 'test-bearer-token',
    token_expires_at: '2026-06-23T20:00:00Z',
    user: {
      id: '10000000-0000-4000-8000-000000000001',
      school_id: null,
      full_name: 'Avery Stone',
      email: 'avery@example.com',
      status: 'active',
      roles: [role],
    },
    resolved_school: school,
    roles: [role],
    permissions: [permission],
  },
  meta: {},
})

export function authError(code, status = 401, details = {}) {
  return {
    response: {
      status,
      data: {
        error: {
          code,
          message: 'Unsafe backend message',
          details,
        },
      },
    },
  }
}

export function createAuthClient(overrides = {}) {
  return {
    post: vi.fn(),
    get: vi.fn(),
    ...overrides,
  }
}

export function createAuthTestI18n() {
  return createI18n({
    legacy: false,
    locale: 'en',
    messages: { en: { auth: authMessages, accountLifecycle: accountLifecycleMessages } },
  })
}

export function createActivePinia() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

export function authGlobalPlugins(extraPlugins = []) {
  return [createActivePinia(), createAuthTestI18n(), ElementPlus, ...extraPlugins]
}
