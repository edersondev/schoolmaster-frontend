<script setup>
import { useI18n } from 'vue-i18n'
import PlatformSupportFeedbackState from './PlatformSupportFeedbackState.vue'
import PlatformSupportStatusBadges from './PlatformSupportStatusBadges.vue'

defineProps({
  items: { type: Array, default: () => [] },
  feedback: { type: Object, default: null },
  emptyState: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['refresh'])
const { t } = useI18n()
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h2 class="text-lg font-semibold text-slate-900">{{ t('platformSupport.oversight.summaries') }}</h2>
        <p class="text-sm text-slate-600">{{ t('platformSupport.oversight.minimized') }}</p>
      </div>
      <ElButton :loading="loading" plain @click="emit('refresh')">{{ t('platformSupport.actions.refresh') }}</ElButton>
    </div>
    <PlatformSupportFeedbackState :feedback="feedback || emptyState" />
    <div class="grid gap-3 md:grid-cols-2">
      <article v-for="item in items" :key="item.id" class="rounded border border-slate-200 bg-white p-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="font-medium text-slate-900">{{ item.name }}</h3>
            <p class="text-sm text-slate-600">{{ item.id }}</p>
          </div>
          <PlatformSupportStatusBadges :state="item.status" :suppressed="item.suppressed" />
        </div>
        <dl class="mt-3 grid gap-2 text-sm">
          <div v-for="(value, key) in item.indicators" :key="key" class="flex justify-between gap-4">
            <dt class="text-slate-600">{{ key }}</dt>
            <dd class="font-medium text-slate-900">{{ value }}</dd>
          </div>
        </dl>
      </article>
    </div>
  </section>
</template>

