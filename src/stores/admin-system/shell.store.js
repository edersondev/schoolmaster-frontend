import { defineStore } from 'pinia'
import { SHELL_FEEDBACK_STATES, createShellFeedbackState } from '@/contracts/admin-system/shell'

const sidebarPreferenceKey = 'schoolmaster.adminSystem.sidebarCollapsed'

function readSidebarPreference() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.localStorage.getItem(sidebarPreferenceKey) === 'true'
}

function writeSidebarPreference(value) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(sidebarPreferenceKey, String(value))
  }
}

export const useAdminShellStore = defineStore('admin-system-shell', {
  state: () => ({
    sidebarCollapsed: readSidebarPreference(),
    mobileDrawerOpen: false,
    activeRouteKey: null,
    notificationPanelOpen: false,
    feedbackState: null,
  }),
  getters: {
    hasBlockingFeedback: (state) =>
      [
        SHELL_FEEDBACK_STATES.unauthorized,
        SHELL_FEEDBACK_STATES.forbidden,
        SHELL_FEEDBACK_STATES.sessionExpired,
      ].includes(state.feedbackState?.state),
  },
  actions: {
    setSidebarCollapsed(value) {
      this.sidebarCollapsed = Boolean(value)
      writeSidebarPreference(this.sidebarCollapsed)
    },
    toggleSidebarCollapsed() {
      this.setSidebarCollapsed(!this.sidebarCollapsed)
    },
    openMobileDrawer() {
      this.mobileDrawerOpen = true
    },
    closeMobileDrawer() {
      this.mobileDrawerOpen = false
    },
    toggleNotificationPanel() {
      this.notificationPanelOpen = !this.notificationPanelOpen
    },
    setActiveRouteKey(routeKey) {
      this.activeRouteKey = routeKey
    },
    setFeedbackState(state) {
      this.feedbackState = state ? createShellFeedbackState(state) : null
    },
    clearFeedbackState() {
      this.feedbackState = null
    },
  },
})
