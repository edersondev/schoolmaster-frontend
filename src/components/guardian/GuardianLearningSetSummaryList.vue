<script setup>
import { useI18n } from 'vue-i18n'
import GuardianStatusControls from './GuardianStatusControls.vue'

defineProps({
  items: { type: Array, default: () => [] },
})

const { t } = useI18n()
</script>

<template>
  <section class="space-y-3" aria-labelledby="guardian-learning-set-summary-title">
    <h3 id="guardian-learning-set-summary-title" class="text-base font-semibold text-slate-950">
      {{ t('guardianSelfService.academics.learningSets') }}
    </h3>
    <p v-if="items.length === 0" class="text-sm text-slate-600">
      {{ t('guardianSelfService.feedback.unavailableSummary') }}
    </p>
    <article v-for="item in items" :key="item.learningSetId" class="rounded-lg border border-slate-200 bg-white p-4">
      <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h4 class="font-medium text-slate-950">{{ item.title }}</h4>
          <p class="text-sm text-slate-600">
            {{ t('guardianSelfService.labels.progress') }}:
            {{ item.progressPercent ?? t('guardianSelfService.labels.unavailable') }}
          </p>
          <p class="text-sm text-slate-600">
            {{ t('guardianSelfService.labels.lastActivity') }}:
            {{ item.lastActivityAt || t('guardianSelfService.labels.unavailable') }}
          </p>
        </div>
        <GuardianStatusControls :status="item.status" />
      </div>
    </article>
  </section>
</template>
