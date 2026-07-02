<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  summary: { type: Object, required: true },
})

const { t } = useI18n()
const gradeStatuses = computed(() => Object.entries(props.summary.gradeStatusCounts ?? {}))
const attendanceStatuses = computed(() => Object.entries(props.summary.attendanceStatusCounts ?? {}))
</script>

<template>
  <div class="grid gap-4 md:grid-cols-3">
    <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 class="text-sm font-medium text-slate-600">{{ t('studentSelfService.overview.assignedLearningSets') }}</h3>
      <p class="mt-2 text-3xl font-semibold text-slate-950">{{ summary.assignedLearningSetCount }}</p>
    </article>
    <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 class="text-sm font-medium text-slate-600">{{ t('studentSelfService.overview.downloadableContent') }}</h3>
      <p class="mt-2 text-3xl font-semibold text-slate-950">{{ summary.downloadableContentCount }}</p>
    </article>
    <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 class="text-sm font-medium text-slate-600">{{ t('studentSelfService.overview.unavailableContent') }}</h3>
      <p class="mt-2 text-3xl font-semibold text-slate-950">{{ summary.unavailableContentCount }}</p>
    </article>
  </div>
  <div class="mt-4 grid gap-4 md:grid-cols-2">
    <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 class="text-sm font-medium text-slate-600">{{ t('studentSelfService.overview.gradeStatuses') }}</h3>
      <p v-if="gradeStatuses.length === 0" class="mt-2 text-sm text-slate-500">{{ t('studentSelfService.feedback.empty') }}</p>
      <dl v-else class="mt-2 space-y-2">
        <div v-for="[status, count] in gradeStatuses" :key="status" class="flex justify-between gap-3">
          <dt>{{ status }}</dt>
          <dd class="font-semibold">{{ count }}</dd>
        </div>
      </dl>
    </article>
    <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 class="text-sm font-medium text-slate-600">{{ t('studentSelfService.overview.attendanceStatuses') }}</h3>
      <p v-if="attendanceStatuses.length === 0" class="mt-2 text-sm text-slate-500">{{ t('studentSelfService.feedback.empty') }}</p>
      <dl v-else class="mt-2 space-y-2">
        <div v-for="[status, count] in attendanceStatuses" :key="status" class="flex justify-between gap-3">
          <dt>{{ status }}</dt>
          <dd class="font-semibold">{{ count }}</dd>
        </div>
      </dl>
    </article>
  </div>
</template>
