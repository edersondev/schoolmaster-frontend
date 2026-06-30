<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowDown, Bell, Expand, Fold, Menu, User } from '@element-plus/icons-vue'

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

const emit = defineEmits(['toggleNavigation', 'toggleNotifications', 'account-command'])
const { t } = useI18n()

const navigationIcon = computed(() => {
  if (props.isMobile) {
    return Menu
  }

  return props.isSidebarCollapsed ? Expand : Fold
})

function onAccountCommand(command) {
  if (command === 'logout') {
    emit('account-command', command)
  }
}
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
      <ElDropdown placement="bottom-end" trigger="click" @command="onAccountCommand">
        <button
          type="button"
          class="admin-header__account"
          :aria-label="t('adminSystem.shell.accountLabel')"
        >
          <ElIcon><User /></ElIcon>
          <span>{{ t('adminSystem.shell.accountLabel') }}</span>
          <ElIcon class="admin-header__account-chevron"><ArrowDown /></ElIcon>
        </button>

        <template #dropdown>
          <ElDropdownMenu>
            <ElDropdownItem command="logout">
              {{ t('adminSystem.shell.logout') }}
            </ElDropdownItem>
          </ElDropdownMenu>
        </template>
      </ElDropdown>
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
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--sm-color-muted);
  cursor: pointer;
  font-size: 0.875rem;
  font: inherit;
  padding: 0.35rem 0.5rem;
  transition:
    background-color 180ms ease,
    color 180ms ease;
  white-space: nowrap;
}

.admin-header__account:hover,
.admin-header__account:focus-visible {
  background: rgba(15, 118, 110, 0.08);
  color: var(--sm-color-text);
  outline: none;
}

.admin-header__account-chevron {
  font-size: 0.75rem;
}

@media (max-width: 900px) {
  .admin-header {
    align-items: flex-start;
  }

  .admin-header__account span {
    display: none;
  }
}
</style>
