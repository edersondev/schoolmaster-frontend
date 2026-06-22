<script setup>
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ADMIN_NAVIGATION_ITEMS, ADMIN_PERMISSIONS } from '@/contracts/admin-system/navigation'
import { useAdminShellPermissions } from '@/composables/admin-system/useAdminShellPermissions'
import { useAdminShellState } from '@/composables/admin-system/useAdminShellState'
import { useAdminShellStore } from '@/stores/admin-system/shell.store'
import AdminShellSidebar from '@/components/admin-system/shell/AdminShellSidebar.vue'
import AdminShellHeader from '@/components/admin-system/shell/AdminShellHeader.vue'
import AdminShellFeedback from '@/components/admin-system/shell/AdminShellFeedback.vue'

const props = defineProps({
  userPermissions: {
    type: Array,
    default: () => [ADMIN_PERMISSIONS.viewDashboard],
  },
})

const route = useRoute()
const { t } = useI18n()
const shellStore = useAdminShellStore()
const { sidebarCollapsed, mobileDrawerOpen, activeRouteKey, notificationPanelOpen, feedbackState } =
  storeToRefs(shellStore)
const { visibleNavigationItems } = useAdminShellPermissions(ADMIN_NAVIGATION_ITEMS, props.userPermissions)
const { isMobile, toggleNavigation, handleRouteSelection } = useAdminShellState({ store: shellStore })

const pageContext = computed(() => ({
  title: t(`adminSystem.${route.meta.title ?? 'shell.title'}`),
  breadcrumb: (route.meta.breadcrumb ?? []).map((item) => ({
    ...item,
    label: t(`adminSystem.${item.label}`),
  })),
}))

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
      />

      <AdminShellFeedback v-if="feedbackState" :feedback-state="feedbackState" />

      <main class="admin-shell__content" :aria-label="t('adminSystem.shell.contentLabel')">
        <RouterView />
      </main>
    </section>
  </div>
</template>

<style scoped>
.admin-shell {
  display: flex;
  min-height: 100vh;
  background:
    linear-gradient(135deg, rgba(15, 118, 110, 0.08), transparent 38%),
    var(--sm-color-bg);
}

.admin-shell__workspace {
  min-width: 0;
  flex: 1;
}

.admin-shell__content {
  padding: 1.25rem;
}

:deep(.admin-shell__drawer .el-drawer__body) {
  padding: 0;
}
</style>
