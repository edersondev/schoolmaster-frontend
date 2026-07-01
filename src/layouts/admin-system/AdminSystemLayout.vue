<script setup>
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  ADMIN_NAVIGATION_ITEMS,
  ADMIN_PERMISSIONS,
  ADMIN_ROUTE_NAMES,
} from '@/contracts/admin-system/navigation'
import { useAdminShellPermissions } from '@/composables/admin-system/useAdminShellPermissions'
import { useAdminShellState } from '@/composables/admin-system/useAdminShellState'
import { AUTH_ROUTE_NAMES } from '@/router/modules/auth.routes'
import { useAdminShellStore } from '@/stores/admin-system/shell.store'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import AdminShellSidebar from '@/components/admin-system/shell/AdminShellSidebar.vue'
import AdminShellHeader from '@/components/admin-system/shell/AdminShellHeader.vue'
import AdminShellFeedback from '@/components/admin-system/shell/AdminShellFeedback.vue'

const props = defineProps({
  userPermissions: {
    type: Array,
    default: null,
  },
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const shellStore = useAdminShellStore()
const sessionStore = useAuthSessionStore()
const { sidebarCollapsed, mobileDrawerOpen, activeRouteKey, notificationPanelOpen, feedbackState } =
  storeToRefs(shellStore)
const userPermissions = computed(() => {
  if (props.userPermissions) return props.userPermissions
  return sessionStore.permissionCodes.length
    ? sessionStore.permissionCodes
    : [ADMIN_PERMISSIONS.viewDashboard]
})
const { visibleNavigationItems } = useAdminShellPermissions(ADMIN_NAVIGATION_ITEMS, userPermissions)
const { isMobile, toggleNavigation, handleRouteSelection } = useAdminShellState({
  store: shellStore,
})

const pageContext = computed(() => ({
  title: t(`adminSystem.${route.meta.title ?? 'shell.title'}`),
  breadcrumb: (route.meta.breadcrumb ?? []).map((item) => ({
    ...item,
    label: t(`adminSystem.${item.label}`),
  })),
}))
const routeViewProps = computed(() =>
  route.name === ADMIN_ROUTE_NAMES.dashboard ? { userPermissions: userPermissions.value } : {},
)

watch(
  () => route.name,
  (routeName) => {
    if (routeName) {
      shellStore.setActiveRouteKey(String(routeName))
    }
  },
  { immediate: true },
)

function onNavigate(routeKey) {
  handleRouteSelection(routeKey)
}

async function onAccountCommand(command) {
  if (command !== 'logout') {
    return
  }

  await sessionStore.logout()
  await router.push({ name: AUTH_ROUTE_NAMES.login })
}
</script>

<template>
  <div class="admin-shell">
    <AdminShellSidebar
      v-if="!isMobile"
      :items="visibleNavigationItems"
      :active-route-key="activeRouteKey"
      :collapsed="sidebarCollapsed"
      @navigate="onNavigate"
    />

    <ElDrawer
      v-model="mobileDrawerOpen"
      :title="t('adminSystem.shell.title')"
      direction="ltr"
      size="18rem"
      :append-to-body="false"
      class="admin-shell__drawer"
    >
      <AdminShellSidebar
        :items="visibleNavigationItems"
        :active-route-key="activeRouteKey"
        :collapsed="false"
        mobile
        @navigate="onNavigate"
      />
    </ElDrawer>

    <section class="admin-shell__workspace">
      <AdminShellHeader
        :page-context="pageContext"
        :is-mobile="isMobile"
        :is-sidebar-collapsed="sidebarCollapsed"
        :notification-panel-open="notificationPanelOpen"
        @toggle-navigation="toggleNavigation"
        @toggle-notifications="shellStore.toggleNotificationPanel"
        @account-command="onAccountCommand"
      />

      <AdminShellFeedback v-if="feedbackState" :feedback-state="feedbackState" />

      <main class="admin-shell__content" :aria-label="t('adminSystem.shell.contentLabel')">
        <RouterView v-slot="{ Component }">
          <component :is="Component" v-bind="routeViewProps" />
        </RouterView>
      </main>
    </section>
  </div>
</template>

<style scoped>
.admin-shell {
  display: flex;
  min-height: 100vh;
  background:
    linear-gradient(135deg, rgba(15, 118, 110, 0.08), transparent 38%), var(--sm-color-bg);
}

.admin-shell__workspace {
  min-width: 0;
  flex: 1;
}

.admin-shell__content {
  min-width: 0;
  overflow-x: hidden;
  padding: 1.25rem;
}

:deep(.admin-shell__drawer .el-drawer__body) {
  padding: 0;
}
</style>
