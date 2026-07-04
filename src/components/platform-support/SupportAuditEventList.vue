<script setup>
import { useI18n } from 'vue-i18n'
import PlatformSupportFeedbackState from './PlatformSupportFeedbackState.vue'
import PlatformSupportStatusBadges from './PlatformSupportStatusBadges.vue'

defineProps({
  items: { type: Array, default: () => [] },
  feedback: { type: Object, default: null },
  emptyState: { type: Object, default: null },
})
const { t } = useI18n()
</script>

<template>
  <section class="space-y-3">
    <PlatformSupportFeedbackState :feedback="feedback || emptyState" />
    <article v-for="item in items" :key="item.id" class="rounded border border-slate-200 bg-white p-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h3 class="font-medium text-slate-900">{{ item.action }}</h3>
        <PlatformSupportStatusBadges :state="item.outcome" />
      </div>
      <dl class="mt-3 grid gap-2 text-sm md:grid-cols-3">
        <div><dt class="text-slate-600">{{ t('platformSupport.labels.actor') }}</dt><dd>{{ item.actorLabel || item.actorUserId }}</dd></div>
        <div><dt class="text-slate-600">{{ t('platformSupport.labels.targetSchool') }}</dt><dd>{{ item.targetSchoolLabel || item.targetSchoolId || 'safe target omitted' }}</dd></div>
        <div><dt class="text-slate-600">{{ t('platformSupport.labels.timestamp') }}</dt><dd>{{ item.occurredAt }}</dd></div>
        <div><dt class="text-slate-600">{{ t('platformSupport.labels.correlationId') }}</dt><dd>{{ item.correlationId }}</dd></div>
        <div><dt class="text-slate-600">{{ t('platformSupport.labels.reasonCode') }}</dt><dd>{{ item.reasonCode }}</dd></div>
      </dl>
    </article>
  </section>
</template>

