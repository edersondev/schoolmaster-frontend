<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { House } from '@element-plus/icons-vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  activeRouteKey: {
    type: String,
    default: null,
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
  mobile: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['navigate'])
const { t } = useI18n()

const iconComponents = {
  House,
}

const sidebarClasses = computed(() => ({
  'admin-sidebar': true,
  'admin-sidebar--collapsed': props.collapsed,
  'admin-sidebar--mobile': props.mobile,
}))
</script>

<template>
  <nav :class="sidebarClasses" aria-label="System administrator navigation">
    <div class="admin-sidebar__brand">
      <span class="admin-sidebar__mark">SM</span>
      <span v-if="!collapsed" class="admin-sidebar__brand-text">{{ t('adminSystem.shell.title') }}</span>
    </div>

    <ElMenu :collapse="collapsed && !mobile" :default-active="activeRouteKey" class="admin-sidebar__menu">
      <ElMenuItem v-for="item in items" :key="item.key" :index="item.key">
        <RouterLink class="admin-sidebar__link" :to="item.destination" @click="emit('navigate', item.key)">
          <ElIcon class="admin-sidebar__icon">
            <component :is="iconComponents[item.icon] ?? House" />
          </ElIcon>
          <span v-if="!collapsed || mobile">{{ t(`adminSystem.${item.labelKey}`) }}</span>
        </RouterLink>
      </ElMenuItem>
    </ElMenu>
  </nav>
</template>

<style scoped>
.admin-sidebar {
  width: 17rem;
  min-height: 100vh;
  border-right: 1px solid var(--sm-color-border);
  background: #10233f;
  color: #ffffff;
  transition: width 0.18s ease;
}

.admin-sidebar--collapsed {
  width: 5rem;
}

.admin-sidebar--mobile {
  width: 100%;
  min-height: 100%;
}

.admin-sidebar__brand {
  display: flex;
  min-height: 4rem;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
}

.admin-sidebar__mark {
  display: inline-flex;
  width: 2.25rem;
  height: 2.25rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #0f766e;
  font-weight: 700;
}

.admin-sidebar__brand-text {
  overflow: hidden;
  font-weight: 700;
  white-space: nowrap;
}

.admin-sidebar__menu {
  border-right: 0;
  background: transparent;
}

.admin-sidebar__link {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.75rem;
  color: inherit;
  text-decoration: none;
}

.admin-sidebar__icon {
  flex: 0 0 auto;
}
</style>
