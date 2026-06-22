<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { DASHBOARD_PLACEHOLDER_STATES } from '@/contracts/admin-system/dashboard'

const props = defineProps({
  card: {
    type: Object,
    required: true,
  },
})

const { t } = useI18n()
const tagType = computed(() => {
  if (props.card.state === DASHBOARD_PLACEHOLDER_STATES.error) {
    return 'danger'
  }

  if (props.card.state === DASHBOARD_PLACEHOLDER_STATES.loading) {
    return 'info'
  }

  return 'warning'
})
</script>

<template>
  <ElCard class="dashboard-summary-card" shadow="never">
    <div class="dashboard-summary-card__top">
      <span class="dashboard-summary-card__label">{{ t(`adminSystem.${card.labelKey}`) }}</span>
      <ElTag :type="tagType" effect="plain">
        {{ t(`adminSystem.dashboard.states.${card.state}`) }}
      </ElTag>
    </div>
    <ElSkeleton v-if="card.state === DASHBOARD_PLACEHOLDER_STATES.loading" :rows="2" animated />
    <ElEmpty v-else :description="t(`adminSystem.${card.dependencyKey}`)" :image-size="56" />
  </ElCard>
</template>

<style scoped>
.dashboard-summary-card {
  min-height: 12rem;
  border-radius: 8px;
}

.dashboard-summary-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.dashboard-summary-card__label {
  font-weight: 700;
}
</style>
