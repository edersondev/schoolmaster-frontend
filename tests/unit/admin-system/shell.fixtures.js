import { createI18n } from 'vue-i18n'
import ElementPlus from 'element-plus'
import { createPinia, setActivePinia } from 'pinia'
import { adminSystemMessages } from '@/locales/admin-system'
import { ADMIN_PERMISSIONS } from '@/contracts/admin-system/navigation'

export const allowedAdminPermissions = [ADMIN_PERMISSIONS.viewDashboard]
export const deniedAdminPermissions = []
export const desktopViewport = 1280
export const tabletViewport = 900
export const mobileViewport = 390

export function createTestI18n() {
  return createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        adminSystem: adminSystemMessages,
      },
    },
  })
}

export function createActivePinia() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

export function adminGlobalPlugins(extraPlugins = []) {
  return [createActivePinia(), createTestI18n(), ElementPlus, ...extraPlugins]
}
