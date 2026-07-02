<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import StudentStatusControls from './StudentStatusControls.vue'

const props = defineProps({
  record: { type: Object, default: null },
  type: { type: String, required: true },
})

const { t } = useI18n()
const isGrade = computed(() => props.type === 'grades')
</script>

<template>
  <article v-if="record" class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <h2 class="text-lg font-semibold text-slate-950">
          {{ isGrade ? t('studentSelfService.grades.detail') : t('studentSelfService.attendance.detail') }}
        </h2>
        <p class="text-sm text-slate-600">
          {{ isGrade ? t('studentSelfService.grades.readOnly') : t('studentSelfService.attendance.readOnly') }}
        </p>
      </div>
      <StudentStatusControls :status="record.status" />
    </div>
    <dl class="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
      <div v-if="isGrade">
        <dt class="font-medium text-slate-900">{{ t('studentSelfService.labels.gradeValue') }}</dt>
        <dd>{{ record.gradeValue }}</dd>
      </div>
      <div v-if="isGrade">
        <dt class="font-medium text-slate-900">{{ t('studentSelfService.labels.gradeLabel') }}</dt>
        <dd>{{ record.gradeLabel || t('studentSelfService.labels.unavailable') }}</dd>
      </div>
      <div v-if="!isGrade">
        <dt class="font-medium text-slate-900">{{ t('studentSelfService.labels.attendanceDate') }}</dt>
        <dd>{{ record.attendanceDate }}</dd>
      </div>
      <div v-if="!isGrade">
        <dt class="font-medium text-slate-900">{{ t('studentSelfService.labels.attendanceStatus') }}</dt>
        <dd>{{ record.attendanceStatus }}</dd>
      </div>
      <div>
        <dt class="font-medium text-slate-900">{{ t('studentSelfService.labels.status') }}</dt>
        <dd>{{ record.status }}</dd>
      </div>
    </dl>
  </article>
</template>
