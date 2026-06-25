import { createI18n } from 'vue-i18n'
import ElementPlus from 'element-plus'
import { createPinia, setActivePinia } from 'pinia'
import { vi } from 'vitest'
import { adminSystemMessages } from '@/locales/admin-system'
import { administrationMessages } from '@/locales/administration'

export const schoolId = '20000000-0000-4000-8000-000000000001'
export const recordId = '30000000-0000-4000-8000-000000000001'

export const paginatedEnvelope = Object.freeze({
  data: [{ id: recordId, name: 'Northfield Academy', code: 'NORTH', status: 'active' }],
  meta: { page: 1, per_page: 25, total: 1 },
})

export const validationError = Object.freeze({
  response: {
    status: 422,
    headers: { 'x-request-id': 'req-test' },
    data: {
      error: {
        code: 'validation_failed',
        message: 'Unsafe backend message',
        details: { errors: { name: ['Name is required.'] } },
      },
    },
  },
})

export function createAdminClient(overrides = {}) {
  return {
    get: vi.fn(),
    post: vi.fn(),
    ...overrides,
  }
}

export function createAdministrationI18n() {
  return createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        adminSystem: adminSystemMessages,
        administration: administrationMessages,
      },
    },
  })
}

export function administrationPlugins() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return [pinia, createAdministrationI18n(), ElementPlus]
}
