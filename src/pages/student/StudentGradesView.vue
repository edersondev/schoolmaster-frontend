<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import StudentAcademicRecordDetail from '@/components/student/StudentAcademicRecordDetail.vue'
import StudentFeedbackState from '@/components/student/StudentFeedbackState.vue'
import StudentStatusControls from '@/components/student/StudentStatusControls.vue'
import StudentWorkspaceNav from '@/components/student/StudentWorkspaceNav.vue'
import {
  useLoadedAcademicRecordDetail,
  useStudentGrades,
} from '@/composables/student/useStudentAcademicRecords'
import { STUDENT_SELF_SERVICE_ROUTE_NAMES } from '@/contracts/student/studentSelfServiceContract'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const records = useStudentGrades()
const detail = useLoadedAcademicRecordDetail('grades', route)
const isDetail = computed(() => Boolean(route.params.gradeId))

onMounted(() => {
  if (!isDetail.value) records.load()
})
</script>

<template>
  <main class="mx-auto w-full max-w-6xl px-4 py-6">
    <StudentWorkspaceNav />
    <ElButton
      v-if="isDetail"
      class="mb-4"
      plain
      @click="router.push({ name: STUDENT_SELF_SERVICE_ROUTE_NAMES.grades })"
    >
      {{ t('studentSelfService.actions.back') }}
    </ElButton>
    <section v-if="isDetail" class="space-y-4">
      <StudentFeedbackState :feedback="detail.feedback.value" />
      <StudentAcademicRecordDetail :record="detail.record.value" type="grades" />
    </section>
    <section v-else class="space-y-4" aria-labelledby="student-grades-title">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 id="student-grades-title" class="text-2xl font-semibold text-slate-950">
          {{ t('studentSelfService.grades.title') }}
        </h1>
        <StudentStatusControls :pagination="records.state.meta" @page-change="records.setPage" />
      </div>
      <StudentFeedbackState :feedback="records.state.feedback" />
      <div class="grid gap-3">
        <article
          v-for="record in records.state.items"
          :key="record.id"
          class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 class="text-base font-semibold text-slate-950">
                {{ t('studentSelfService.labels.gradeValue') }}: {{ record.gradeValue }}
              </h2>
              <p class="text-sm text-slate-600">{{ record.gradeLabel || t('studentSelfService.labels.unavailable') }}</p>
            </div>
            <StudentStatusControls :status="record.status" />
          </div>
          <ElButton
            class="mt-4"
            type="primary"
            plain
            @click="router.push({ name: STUDENT_SELF_SERVICE_ROUTE_NAMES.gradeDetail, params: { gradeId: record.id } })"
          >
            {{ t('studentSelfService.actions.open') }}
          </ElButton>
        </article>
      </div>
    </section>
  </main>
</template>
