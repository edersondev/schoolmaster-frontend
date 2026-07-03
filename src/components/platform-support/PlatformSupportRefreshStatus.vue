<script setup>
import { Refresh } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  pending: { type: Boolean, default: false },
  lastRefreshedAt: { type: String, default: '' },
  feedback: { type: Object, default: null },
})
const emit = defineEmits(['refresh'])

const { t } = useI18n()
const label = computed(() => props.lastRefreshedAt || t('platformSupport.actions.refresh'))
</script>

<template>
  <div class="flex flex-wrap items-center gap-3" role="status" aria-live="polite">
    <ElButton :icon="Refresh" :loading="pending" plain @click="emit('refresh')">
      {{ t('platformSupport.actions.refresh') }}
    </ElButton>
    <span class="text-sm text-slate-600">{{ label }}</span>
    <span v-if="feedback" class="text-sm text-slate-600">
      {{ t(`platformSupport.feedback.${feedback.type}`, feedback.type) }}
    </span>
  </div>
</template>

