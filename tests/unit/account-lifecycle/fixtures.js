import { createI18n } from 'vue-i18n'
import ElementPlus from 'element-plus'
import { createPinia, setActivePinia } from 'pinia'
import { vi } from 'vitest'
import { authMessages } from '@/locales/auth'
import { accountLifecycleMessages } from '@/locales/account-lifecycle'
import { administrationMessages } from '@/locales/administration'
import { administrationLifecycleMessages } from '@/locales/administration-lifecycle'
import { adminSystemMessages } from '@/locales/admin-system'

export const schoolId = '20000000-0000-4000-8000-000000000001'
export const userId = '30000000-0000-4000-8000-000000000001'
export const validToken = 'abcdefghijklmnopqrstuvwxyz1234567890'

export function createLifecycleI18n() {
  return createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        auth: authMessages,
        accountLifecycle: accountLifecycleMessages,
        administration: administrationMessages,
        administrationLifecycle: administrationLifecycleMessages,
        adminSystem: adminSystemMessages,
      },
    },
  })
}

export function lifecyclePlugins() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return [pinia, createLifecycleI18n(), ElementPlus]
}

export function createClient(overrides = {}) {
  return {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  }
}

export function lifecycleError(code, status = 422, details = {}) {
  return {
    response: {
      status,
      headers: { 'x-request-id': 'req-test' },
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

export const userRecord = Object.freeze({
  id: userId,
  fullName: 'Avery Stone',
  email: 'avery@example.com',
  status: 'active',
  roles: [{ id: 'role-1' }],
})

