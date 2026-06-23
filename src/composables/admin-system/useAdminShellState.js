import { computed, onMounted, onUnmounted, shallowRef, toValue } from 'vue'
import { useAdminShellStore } from '@/stores/admin-system/shell.store'

export const SHELL_VIEWPORTS = Object.freeze({
  mobile: 'mobile',
  tablet: 'tablet',
  desktop: 'desktop',
})

export function getViewportMode(width) {
  if (width < 768) {
    return SHELL_VIEWPORTS.mobile
  }

  if (width < 1180) {
    return SHELL_VIEWPORTS.tablet
  }

  return SHELL_VIEWPORTS.desktop
}

export function isMobileViewport(width) {
  return getViewportMode(width) === SHELL_VIEWPORTS.mobile
}

export function useAdminShellState(options = {}) {
  const shellStore = options.store ?? useAdminShellStore()
  const viewportWidth = shallowRef(
    options.width ?? (typeof window === 'undefined' ? 1280 : window.innerWidth),
  )

  const viewportMode = computed(() => getViewportMode(toValue(viewportWidth)))
  const isMobile = computed(() => viewportMode.value === SHELL_VIEWPORTS.mobile)

  function updateViewportWidth() {
    viewportWidth.value = window.innerWidth
  }

  function toggleNavigation() {
    if (isMobile.value) {
      shellStore.openMobileDrawer()
      return
    }

    shellStore.toggleSidebarCollapsed()
  }

  function handleRouteSelection(routeKey) {
    shellStore.setActiveRouteKey(routeKey)
    if (isMobile.value) {
      shellStore.closeMobileDrawer()
    }
  }

  onMounted(() => {
    if (typeof window !== 'undefined' && options.width === undefined) {
      window.addEventListener('resize', updateViewportWidth)
    }
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined' && options.width === undefined) {
      window.removeEventListener('resize', updateViewportWidth)
    }
  })

  return {
    viewportWidth,
    viewportMode,
    isMobile,
    toggleNavigation,
    handleRouteSelection,
  }
}
