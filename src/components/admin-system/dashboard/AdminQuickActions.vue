<script setup>
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { House } from '@element-plus/icons-vue'

defineProps({
  actions: {
    type: Array,
    required: true,
  },
})

const { t } = useI18n()
const iconComponents = {
  House,
}
</script>

<template>
  <ElCard class="quick-actions" shadow="never">
    <template #header>
      <span>{{ t('adminSystem.quickActions.title') }}</span>
    </template>

    <ElEmpty v-if="actions.length === 0" :description="t('adminSystem.quickActions.empty')" :image-size="72" />

    <div v-else class="quick-actions__list">
      <RouterLink v-for="action in actions" :key="action.key" class="quick-actions__item" :to="action.destination">
        <ElButton class="quick-actions__button" :icon="iconComponents[action.icon] ?? House" text>
          <span>{{ t(`adminSystem.${action.labelKey}`) }}</span>
        </ElButton>
        <span class="quick-actions__description">{{ t(`adminSystem.${action.descriptionKey}`) }}</span>
      </RouterLink>
    </div>
  </ElCard>
</template>

<style scoped>
.quick-actions {
  min-height: 18rem;
  border-radius: 8px;
}

.quick-actions__list {
  display: grid;
  gap: 0.75rem;
}

.quick-actions__item {
  display: grid;
  gap: 0.2rem;
  border: 1px solid var(--sm-color-border);
  border-radius: 8px;
  padding: 0.75rem;
  color: inherit;
  text-decoration: none;
}

.quick-actions__button {
  justify-content: flex-start;
  padding: 0;
  font-weight: 700;
}

.quick-actions__description {
  color: var(--sm-color-muted);
  font-size: 0.85rem;
}
</style>
