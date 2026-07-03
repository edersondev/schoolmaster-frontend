<script setup>
import { useI18n } from 'vue-i18n'
import ReportingFeedbackState from './ReportingFeedbackState.vue'

defineProps({
  catalog: { type: Object, default: null },
  feedback: { type: Object, default: null },
})

const { t } = useI18n()
</script>

<template>
  <section class="space-y-4">
    <header class="flex items-center justify-between gap-3">
      <h2 class="text-lg font-semibold text-slate-950">{{ t('reporting.catalog.title') }}</h2>
      <slot name="actions" />
    </header>
    <ReportingFeedbackState :feedback="feedback" />
    <div v-if="catalog" class="grid gap-3 md:grid-cols-2">
      <article
        v-for="domain in catalog.domains"
        :key="domain.id || domain.code || domain.name"
        class="rounded-md border border-slate-200 bg-white p-4"
      >
        <h3 class="text-sm font-semibold text-slate-900">{{ domain.label || domain.name || domain.id }}</h3>
        <p class="mt-1 text-sm text-slate-600">{{ domain.description || t('reporting.catalog.approvedDomain') }}</p>
      </article>
    </div>
    <div v-if="catalog" class="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
      {{ t('reporting.catalog.limits') }}:
      {{ catalog.complexityLimits.fields }} {{ t('reporting.labels.fields') }},
      {{ catalog.complexityLimits.filters }} {{ t('reporting.labels.filters') }},
      {{ catalog.complexityLimits.grouping }} {{ t('reporting.labels.grouping') }},
      {{ catalog.complexityLimits.sorting }} {{ t('reporting.labels.sorting') }}.
    </div>
  </section>
</template>
