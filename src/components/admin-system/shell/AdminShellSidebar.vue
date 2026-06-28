<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  Avatar,
  Calendar,
  Clock,
  House,
  Key,
  Lock,
  Management,
  User,
} from '@element-plus/icons-vue'

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
  Avatar,
  Calendar,
  Clock,
  House,
  Key,
  Lock,
  Management,
  User,
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
      <span v-if="!collapsed" class="admin-sidebar__brand-text">{{
        t('adminSystem.shell.title')
      }}</span>
    </div>

    <ElMenu
      :collapse="collapsed && !mobile"
      :default-active="activeRouteKey"
      class="admin-sidebar__menu"
    >
      <ElMenuItem v-for="item in items" :key="item.key" :index="item.key">
        <RouterLink
          class="admin-sidebar__link"
          :to="item.destination"
          @click="emit('navigate', item.key)"
        >
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
  border-right: 1px solid rgba(148, 163, 184, 0.22);
  background:
    radial-gradient(circle at 20% 0%, rgba(20, 184, 166, 0.24), transparent 30%),
    linear-gradient(180deg, #08162b 0%, #0f2747 52%, #10233f 100%);
  color: #ffffff;
  box-shadow: 18px 0 45px rgba(15, 23, 42, 0.16);
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
  padding: 0 1.1rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.16);
  background: rgba(8, 22, 43, 0.58);
}

.admin-sidebar__mark {
  display: inline-flex;
  width: 2.25rem;
  height: 2.25rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(153, 246, 228, 0.42);
  border-radius: 12px;
  background: linear-gradient(135deg, #14b8a6, #0f766e);
  box-shadow: 0 10px 24px rgba(20, 184, 166, 0.22);
  font-weight: 700;
  color: #ffffff;
}

.admin-sidebar__brand-text {
  overflow: hidden;
  color: #f8fafc;
  font-weight: 700;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.admin-sidebar__menu {
  --el-menu-bg-color: transparent;
  --el-menu-hover-bg-color: rgba(45, 212, 191, 0.12);
  --el-menu-active-color: #ffffff;
  --el-menu-text-color: #dbeafe;

  border-right: 0;
  background: transparent;
  padding: 0.75rem;
}

.admin-sidebar :deep(.el-menu-item) {
  position: relative;
  height: 2.85rem;
  margin: 0.18rem 0;
  border: 1px solid transparent;
  border-radius: 14px;
  color: #dbeafe;
  font-weight: 600;
  letter-spacing: 0.005em;
}

.admin-sidebar :deep(.el-menu-item:hover),
.admin-sidebar :deep(.el-menu-item:focus-within) {
  border-color: rgba(125, 211, 252, 0.2);
  background: rgba(226, 232, 240, 0.1);
  color: #ffffff;
}

.admin-sidebar :deep(.el-menu-item.is-active) {
  border-color: rgba(153, 246, 228, 0.44);
  background:
    linear-gradient(90deg, rgba(20, 184, 166, 0.28), rgba(20, 184, 166, 0.1)),
    rgba(15, 23, 42, 0.34);
  color: #ffffff;
  box-shadow:
    inset 3px 0 0 #5eead4,
    0 10px 26px rgba(8, 22, 43, 0.26);
}

.admin-sidebar :deep(.el-menu-item.is-active::after) {
  position: absolute;
  top: 50%;
  right: 0.85rem;
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 999px;
  background: #5eead4;
  box-shadow: 0 0 16px rgba(94, 234, 212, 0.78);
  content: '';
  transform: translateY(-50%);
}

.admin-sidebar :deep(.el-menu--collapse .el-menu-item.is-active::after) {
  display: none;
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
  color: #93c5fd;
  font-size: 1.1rem;
}

.admin-sidebar :deep(.el-menu-item:hover) .admin-sidebar__icon,
.admin-sidebar :deep(.el-menu-item:focus-within) .admin-sidebar__icon,
.admin-sidebar :deep(.el-menu-item.is-active) .admin-sidebar__icon {
  color: #5eead4;
}

.admin-sidebar--collapsed .admin-sidebar__brand {
  justify-content: center;
  padding-inline: 0.75rem;
}

.admin-sidebar--collapsed .admin-sidebar__menu {
  padding-inline: 0.55rem;
}

.admin-sidebar--collapsed .admin-sidebar__link {
  justify-content: center;
  gap: 0;
}
</style>
