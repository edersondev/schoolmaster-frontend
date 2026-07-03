<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  filters: { type: Object, required: true },
})
const emit = defineEmits(['update'])
const { t } = useI18n()
</script>

<template>
  <div class="grid gap-3 rounded border border-slate-200 bg-white p-4 md:grid-cols-3">
    <ElInput :model-value="filters.action" :placeholder="t('platformSupport.labels.action')" @update:model-value="emit('update', { action: $event })" />
    <ElInput :model-value="filters.outcome" :placeholder="t('platformSupport.labels.outcome')" @update:model-value="emit('update', { outcome: $event })" />
    <ElInput :model-value="filters.correlationId" :placeholder="t('platformSupport.labels.correlationId')" @update:model-value="emit('update', { correlationId: $event })" />
  </div>
</template>

