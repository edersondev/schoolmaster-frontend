<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import StudentAcademicOverviewCards from '@/components/student/StudentAcademicOverviewCards.vue'
import StudentFeedbackState from '@/components/student/StudentFeedbackState.vue'
import StudentWorkspaceNav from '@/components/student/StudentWorkspaceNav.vue'
import { useStudentAcademicOverview } from '@/composables/student/useStudentAcademicOverview'

const { t } = useI18n()
const overview = useStudentAcademicOverview()

onMounted(() => {
  overview.load()
})
</script>

<template>
  <main class="mx-auto w-full max-w-6xl px-4 py-6">
    <StudentWorkspaceNav />
    <section class="space-y-4" aria-labelledby="student-overview-title">
      <div>
        <h1 id="student-overview-title" class="text-2xl font-semibold text-slate-950">
          {{ t('studentSelfService.overview.title') }}
        </h1>
        <p class="mt-1 text-sm text-slate-600">{{ t('studentSelfService.overview.blockedReports') }}</p>
      </div>
      <StudentFeedbackState :feedback="overview.state.feedback" />
      <StudentAcademicOverviewCards :summary="overview.summary.value" />
    </section>
  </main>
</template>
