<script setup>
import { useI18n } from 'vue-i18n'
import { DASHBOARD_PLACEHOLDER_STATES } from '@/contracts/admin-system/dashboard'

defineProps({
  activity: {
    type: Object,
    required: true,
  },
})

const { t } = useI18n()
</script>

<template>
  <ElCard class="activity-panel" shadow="never">
    <template #header>
      <span>{{ t(`adminSystem.${activity.titleKey}`) }}</span>
    </template>
    <ElSkeleton v-if="activity.state === DASHBOARD_PLACEHOLDER_STATES.loading" :rows="4" animated />
    <ElEmpty v-else :description="t(`adminSystem.${activity.messageKey}`)" :image-size="72" />
  </ElCard>
</template>

<style scoped>
.activity-panel {
  min-height: 18rem;
  border-radius: 8px;
}
</style>
