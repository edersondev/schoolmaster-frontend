<script setup>
import { onMounted } from 'vue'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import TeacherWorkflowFeedbackState from '../components/TeacherWorkflowFeedbackState.vue'
import TeacherWorkflowStatusControls from '../components/TeacherWorkflowStatusControls.vue'
import { useQuestionnaires } from '../composables/useQuestionnaires'
import { TEACHER_WORKFLOW_ROUTE_NAMES } from './routeNames'

const session = useAuthSessionStore()
const { state, loadList } = useQuestionnaires({ options: { schoolId: session.activeSchool?.id } })

onMounted(() => loadList())
</script>

<template>
  <main class="grid gap-6 p-6">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-sm-brand">Teacher workspace</p>
        <h1 class="text-3xl font-bold text-sm-heading">Questionnaires</h1>
      </div>
      <RouterLink :to="{ name: TEACHER_WORKFLOW_ROUTE_NAMES.questionnaireCreate }">
        <ElButton type="primary">Create questionnaire</ElButton>
      </RouterLink>
    </header>
    <TeacherWorkflowFeedbackState :feedback="state.feedback" @retry="loadList" />
    <section class="grid gap-3">
      <article v-for="item in state.items" :key="item.id" class="rounded-2xl border border-sm-border bg-sm-surface p-5">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="text-xl font-semibold text-sm-heading">{{ item.title }}</h2>
            <p class="text-sm text-sm-muted">{{ item.questions.length }} questions</p>
          </div>
          <TeacherWorkflowStatusControls :status="item.status" :show-lifecycle="false" />
        </div>
        <RouterLink :to="{ name: TEACHER_WORKFLOW_ROUTE_NAMES.questionnaireDetail, params: { questionnaireId: item.id } }">
          <ElButton class="mt-4">Open detail</ElButton>
        </RouterLink>
      </article>
    </section>
  </main>
</template>
