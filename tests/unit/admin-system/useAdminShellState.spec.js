import { beforeEach, describe, expect, it } from 'vitest'
import { storeToRefs } from 'pinia'
import {
  SHELL_VIEWPORTS,
  getViewportMode,
  useAdminShellState,
} from '@/composables/admin-system/useAdminShellState'
import { useAdminShellStore } from '@/stores/admin-system/shell.store'
import { createActivePinia, desktopViewport, mobileViewport, tabletViewport } from './shell.fixtures'

describe('useAdminShellState', () => {
  beforeEach(() => {
    window.localStorage.clear()
    createActivePinia()
  })

  it('classifies desktop, tablet, and mobile viewport states', () => {
    expect(getViewportMode(desktopViewport)).toBe(SHELL_VIEWPORTS.desktop)
    expect(getViewportMode(tabletViewport)).toBe(SHELL_VIEWPORTS.tablet)
    expect(getViewportMode(mobileViewport)).toBe(SHELL_VIEWPORTS.mobile)
  })

  it('toggles collapsed sidebar on desktop and closes mobile drawer after route selection', () => {
    const store = useAdminShellStore()
    const desktopShell = useAdminShellState({ store, width: desktopViewport })
    const { sidebarCollapsed, mobileDrawerOpen, activeRouteKey } = storeToRefs(store)

    desktopShell.toggleNavigation()
    expect(sidebarCollapsed.value).toBe(true)

    const mobileShell = useAdminShellState({ store, width: mobileViewport })
    mobileShell.toggleNavigation()
    expect(mobileDrawerOpen.value).toBe(true)

    mobileShell.handleRouteSelection('adminDashboard')
    expect(activeRouteKey.value).toBe('adminDashboard')
    expect(mobileDrawerOpen.value).toBe(false)
  })
})
