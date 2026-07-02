<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import StudentFeedbackState from '@/components/student/StudentFeedbackState.vue'
import StudentLearningSetEntryList from '@/components/student/StudentLearningSetEntryList.vue'
import StudentWorkspaceNav from '@/components/student/StudentWorkspaceNav.vue'
import { useLoadedLearningSetDetail } from '@/composables/student/useAssignedLearningSets'
import { STUDENT_SELF_SERVICE_ROUTE_NAMES } from '@/contracts/student/studentSelfServiceContract'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { learningSet, feedback } = useLoadedLearningSetDetail(route)
</script>

<template>
  <main class="mx-auto w-full max-w-6xl px-4 py-6">
    <StudentWorkspaceNav />
    <ElButton class="mb-4" plain @click="router.push({ name: STUDENT_SELF_SERVICE_ROUTE_NAMES.assignedLearningSets })">
      {{ t('studentSelfService.actions.back') }}
    </ElButton>
    <StudentFeedbackState :feedback="feedback" />
    <section v-if="learningSet" class="space-y-4" aria-labelledby="learning-set-detail-title">
      <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h1 id="learning-set-detail-title" class="text-2xl font-semibold text-slate-950">
          {{ learningSet.title }}
        </h1>
        <p class="mt-1 text-sm text-slate-600">{{ learningSet.status }}</p>
      </div>
      <StudentLearningSetEntryList :entries="learningSet.entries" />
    </section>
  </main>
</template>
