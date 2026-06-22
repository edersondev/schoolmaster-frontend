<script setup>
import { useI18n } from 'vue-i18n'
import { ADMIN_PERMISSIONS, ADMIN_QUICK_ACTIONS } from '@/contracts/admin-system/navigation'
import {
  activityPlaceholder,
  dashboardNoticePlaceholder,
  dashboardSummaryCards,
} from '@/contracts/admin-system/dashboard'
import { useAdminQuickActions } from '@/composables/admin-system/useAdminQuickActions'
import AdminDashboardSummaryCard from '@/components/admin-system/dashboard/AdminDashboardSummaryCard.vue'
import AdminRecentActivityPanel from '@/components/admin-system/dashboard/AdminRecentActivityPanel.vue'
import AdminNotificationPlaceholder from '@/components/admin-system/dashboard/AdminNotificationPlaceholder.vue'
import AdminQuickActions from '@/components/admin-system/dashboard/AdminQuickActions.vue'

const props = defineProps({
  userPermissions: {
    type: Array,
    default: () => [ADMIN_PERMISSIONS.viewDashboard],
  },
})

const { t } = useI18n()
const { visibleQuickActions } = useAdminQuickActions(ADMIN_QUICK_ACTIONS, props.userPermissions)
</script>

<template>
  <div class="admin-dashboard">
    <section class="admin-dashboard__intro">
      <div>
        <p class="admin-dashboard__eyebrow">{{ t('adminSystem.shell.title') }}</p>
        <h2 class="admin-dashboard__title">{{ t('adminSystem.dashboard.title') }}</h2>
        <p class="admin-dashboard__subtitle">{{ t('adminSystem.dashboard.subtitle') }}</p>
      </div>
      <AdminNotificationPlaceholder :notice="dashboardNoticePlaceholder" />
    </section>

    <section class="admin-dashboard__grid" :aria-label="t('adminSystem.dashboard.summaryTitle')">
      <AdminDashboardSummaryCard v-for="card in dashboardSummaryCards" :key="card.slotId" :card="card" />
    </section>

    <section class="admin-dashboard__lower">
      <AdminRecentActivityPanel :activity="activityPlaceholder" />
      <AdminQuickActions :actions="visibleQuickActions" />
    </section>
  </div>
</template>

<style scoped>
.admin-dashboard {
  display: grid;
  gap: 1rem;
}

.admin-dashboard__intro,
.admin-dashboard__lower {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(17rem, 24rem);
  gap: 1rem;
  align-items: stretch;
}

.admin-dashboard__eyebrow {
  margin: 0 0 0.35rem;
  color: var(--sm-color-brand);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.admin-dashboard__title {
  margin: 0;
  font-size: 1.75rem;
  line-height: 1.15;
}

.admin-dashboard__subtitle {
  max-width: 48rem;
  margin: 0.5rem 0 0;
  color: var(--sm-color-muted);
}

.admin-dashboard__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

@media (max-width: 920px) {
  .admin-dashboard__intro,
  .admin-dashboard__lower,
  .admin-dashboard__grid {
    grid-template-columns: 1fr;
  }
}
</style>
