<script setup>
import { useI18n } from 'vue-i18n'
import GuardianStatusControls from './GuardianStatusControls.vue'

defineProps({
  student: { type: Object, default: null },
})

const { t } = useI18n()
</script>

<template>
  <section v-if="student" class="space-y-4" aria-labelledby="guardian-student-detail-title">
    <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <h2 id="guardian-student-detail-title" class="text-xl font-semibold text-slate-950">
          {{ student.fullName }}
        </h2>
        <p class="text-sm text-slate-600">{{ t('guardianSelfService.studentDetail.limitedProfile') }}</p>
      </div>
      <GuardianStatusControls :status="student.status" :relationship-label="student.relationshipLabel" />
    </div>
    <dl class="grid gap-3 md:grid-cols-2">
      <div class="rounded-lg border border-slate-200 bg-white p-4">
        <dt class="text-sm font-medium text-slate-600">{{ t('guardianSelfService.labels.dateOfBirth') }}</dt>
        <dd class="mt-1 text-slate-950">{{ student.dateOfBirth || t('guardianSelfService.labels.unavailable') }}</dd>
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-4">
        <dt class="text-sm font-medium text-slate-600">{{ t('guardianSelfService.labels.registrationNumber') }}</dt>
        <dd class="mt-1 text-slate-950">{{ student.registrationNumber || t('guardianSelfService.labels.unavailable') }}</dd>
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-4">
        <dt class="text-sm font-medium text-slate-600">{{ t('guardianSelfService.labels.gradeLevel') }}</dt>
        <dd class="mt-1 text-slate-950">{{ student.enrollmentSummary?.gradeLevel || t('guardianSelfService.labels.unavailable') }}</dd>
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-4">
        <dt class="text-sm font-medium text-slate-600">{{ t('guardianSelfService.labels.academicYear') }}</dt>
        <dd class="mt-1 text-slate-950">{{ student.enrollmentSummary?.academicYearLabel || t('guardianSelfService.labels.unavailable') }}</dd>
      </div>
    </dl>
  </section>
</template>
