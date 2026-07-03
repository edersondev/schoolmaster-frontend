<script setup>
import { useI18n } from 'vue-i18n'
import ReportingFeedbackState from './ReportingFeedbackState.vue'
import ReportingStatusBadges from './ReportingStatusBadges.vue'

defineProps({
  items: { type: Array, default: () => [] },
  feedback: { type: Object, default: null },
  emptyState: { type: Object, default: null },
})
const emit = defineEmits(['select', 'new'])
const { t } = useI18n()
</script>

<template>
  <section class="space-y-4">
    <header class="flex items-center justify-between gap-3">
      <h2 class="text-lg font-semibold text-slate-950">{{ t('reporting.definitions.title') }}</h2>
      <ElButton type="primary" @click="emit('new')">{{ t('reporting.actions.create') }}</ElButton>
    </header>
    <ReportingFeedbackState :feedback="feedback || emptyState" />
    <div class="grid gap-3 md:grid-cols-2">
      <article v-for="item in items" :key="item.id" class="rounded-md border border-slate-200 bg-white p-4">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h3 class="font-semibold text-slate-950">{{ item.name }}</h3>
            <p class="text-sm text-slate-600">{{ item.domain }}</p>
          </div>
          <ReportingStatusBadges :lifecycle-state="item.lifecycleState" />
        </div>
        <ElButton link type="primary" class="mt-3" @click="emit('select', item)">{{ t('reporting.actions.open') }}</ElButton>
      </article>
    </div>
  </section>
</template>
