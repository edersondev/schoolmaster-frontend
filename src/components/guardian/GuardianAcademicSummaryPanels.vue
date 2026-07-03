<script setup>
import { useI18n } from 'vue-i18n'
import GuardianStatusControls from './GuardianStatusControls.vue'

defineProps({
  gradeSummary: { type: Object, default: null },
  attendanceSummary: { type: Object, default: null },
})

const { t } = useI18n()
</script>

<template>
  <section class="grid gap-4 md:grid-cols-2" aria-label="Academic summary panels">
    <article class="rounded-lg border border-slate-200 bg-white p-4">
      <div class="mb-3 flex items-center justify-between gap-3">
        <h3 class="text-base font-semibold text-slate-950">{{ t('guardianSelfService.academics.gradeSummary') }}</h3>
        <GuardianStatusControls :status="gradeSummary?.status" />
      </div>
      <p class="text-sm text-slate-600">
        {{ t('guardianSelfService.labels.average') }}:
        {{ gradeSummary?.average ?? t('guardianSelfService.labels.unavailable') }}
      </p>
      <p class="text-sm text-slate-600">
        {{ t('guardianSelfService.labels.scale') }}:
        {{ gradeSummary?.scale || t('guardianSelfService.labels.unavailable') }}
      </p>
    </article>
    <article class="rounded-lg border border-slate-200 bg-white p-4">
      <div class="mb-3 flex items-center justify-between gap-3">
        <h3 class="text-base font-semibold text-slate-950">{{ t('guardianSelfService.academics.attendanceSummary') }}</h3>
        <GuardianStatusControls :status="attendanceSummary?.status" />
      </div>
      <p class="text-sm text-slate-600">
        {{ t('guardianSelfService.labels.attendanceRate') }}:
        {{ attendanceSummary?.attendanceRate ?? t('guardianSelfService.labels.unavailable') }}
      </p>
      <p class="text-sm text-slate-600">
        {{ t('guardianSelfService.labels.absences') }}:
        {{ attendanceSummary?.totalAbsences ?? t('guardianSelfService.labels.unavailable') }}
      </p>
    </article>
  </section>
</template>
