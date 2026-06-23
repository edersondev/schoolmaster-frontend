<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Bell, Expand, Fold, Menu, User } from '@element-plus/icons-vue'

const props = defineProps({
  pageContext: {
    type: Object,
    required: true,
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
  isSidebarCollapsed: {
    type: Boolean,
    default: false,
  },
  notificationPanelOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggleNavigation', 'toggleNotifications'])
const { t } = useI18n()

const navigationIcon = computed(() => {
  if (props.isMobile) {
    return Menu
  }

  return props.isSidebarCollapsed ? Expand : Fold
})
</script>

<template>
  <header class="admin-header">
    <div class="admin-header__context">
      <ElButton
        circle
        :icon="navigationIcon"
        :aria-label="isMobile ? t('adminSystem.shell.drawerToggle') : t('adminSystem.shell.sidebarToggle')"
        :title="isMobile ? t('adminSystem.shell.drawerToggle') : t('adminSystem.shell.sidebarToggle')"
        @click="emit('toggleNavigation')"
      />

      <div class="admin-header__titles">
        <ElBreadcrumb v-if="pageContext.breadcrumb.length" separator="/">
          <ElBreadcrumbItem v-for="item in pageContext.breadcrumb" :key="item.label">
            {{ item.label }}
          </ElBreadcrumbItem>
        </ElBreadcrumb>
        <h1 class="admin-header__title">{{ pageContext.title }}</h1>
      </div>
    </div>

    <div class="admin-header__actions">
      <ElButton
        circle
        :type="notificationPanelOpen ? 'primary' : 'default'"
        :icon="Bell"
        :aria-label="t('adminSystem.shell.noticeToggle')"
        :title="t('adminSystem.shell.noticeToggle')"
        @click="emit('toggleNotifications')"
      />
      <div class="admin-header__account" :aria-label="t('adminSystem.shell.accountLabel')">
        <ElIcon><User /></ElIcon>
        <span>{{ t('adminSystem.shell.accountLabel') }}</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.admin-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  min-height: 4rem;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--sm-color-border);
  background: rgba(255, 255, 255, 0.92);
  padding: 0.75rem 1.25rem;
  backdrop-filter: blur(14px);
}

.admin-header__context,
.admin-header__actions {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.75rem;
}

.admin-header__titles {
  min-width: 0;
}

.admin-header__title {
  margin: 0.15rem 0 0;
  font-size: 1.25rem;
  font-weight: 750;
  line-height: 1.2;
}

.admin-header__account {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--sm-color-muted);
  font-size: 0.875rem;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .admin-header {
    align-items: flex-start;
  }

  .admin-header__account span {
    display: none;
  }
}
</style>
