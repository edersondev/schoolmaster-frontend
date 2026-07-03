<script setup>
import { useI18n } from 'vue-i18n'
import PlatformSupportFeedbackState from './PlatformSupportFeedbackState.vue'
import PlatformSupportStatusBadges from './PlatformSupportStatusBadges.vue'

defineProps({
  overview: { type: Object, default: null },
  feedback: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['refresh'])
const { t } = useI18n()
</script>

<template>
  <section class="space-y-4 rounded border border-slate-200 bg-white p-4">
    <div class="flex items-center justify-between gap-3">
      <h2 class="text-lg font-semibold text-slate-900">{{ t('platformSupport.oversight.reporting') }}</h2>
      <ElButton :loading="loading" plain @click="emit('refresh')">{{ t('platformSupport.actions.refresh') }}</ElButton>
    </div>
    <PlatformSupportFeedbackState :feedback="feedback" />
    <PlatformSupportStatusBadges :suppressed="overview?.suppressed" />
    <div class="grid gap-4 md:grid-cols-2">
      <div>
        <h3 class="text-sm font-medium text-slate-700">{{ t('platformSupport.labels.health') }}</h3>
        <dl class="mt-2 space-y-2 text-sm">
          <div v-for="(value, key) in overview?.health" :key="key" class="flex justify-between gap-4">
            <dt class="text-slate-600">{{ key }}</dt>
            <dd class="font-medium text-slate-900">{{ value }}</dd>
          </div>
        </dl>
      </div>
      <div>
        <h3 class="text-sm font-medium text-slate-700">{{ t('platformSupport.labels.lifecycle') }}</h3>
        <dl class="mt-2 space-y-2 text-sm">
          <div v-for="(value, key) in overview?.lifecycle" :key="key" class="flex justify-between gap-4">
            <dt class="text-slate-600">{{ key }}</dt>
            <dd class="font-medium text-slate-900">{{ value }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>

