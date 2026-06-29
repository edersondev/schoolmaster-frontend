<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  selectedCount: { type: Number, default: 0 },
  actions: { type: Array, default: () => [] },
  overLimit: { type: Boolean, default: false },
  pending: { type: Boolean, default: false },
})

const emit = defineEmits(['action', 'clear'])
const { t } = useI18n()
const hasSelection = computed(() => props.selectedCount > 0)
</script>

<template>
  <div
    v-if="hasSelection"
    class="flex flex-col gap-3 border-b border-sm-border bg-sm-surface-muted p-3 sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="text-sm text-sm-text">
      {{ t('administrationLifecycle.bulk.selected', { count: selectedCount }) }}
      <p v-if="overLimit" class="mt-1 text-red-700">
        {{ t('administrationLifecycle.bulk.maxSelection') }}
      </p>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <ElButton size="small" :disabled="pending" @click="emit('clear')">
        {{ t('administrationLifecycle.bulk.clear') }}
      </ElButton>
      <ElButton
        v-for="action in actions"
        :key="action"
        size="small"
        type="primary"
        :disabled="pending || overLimit"
        :loading="pending"
        @click="emit('action', action)"
      >
        {{ t(`administrationLifecycle.actions.${action}`) }}
      </ElButton>
    </div>
  </div>
</template>
