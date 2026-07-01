<script setup>
import { onMounted } from 'vue'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import TeacherWorkflowFeedbackState from '../components/TeacherWorkflowFeedbackState.vue'
import TeacherWorkflowStatusControls from '../components/TeacherWorkflowStatusControls.vue'
import { useTeacherContent } from '../composables/useTeacherContent'
import { useQuestionnaires } from '../composables/useQuestionnaires'

const session = useAuthSessionStore()
const options = { schoolId: session.activeSchool?.id }
const content = useTeacherContent({ options })
const questionnaires = useQuestionnaires({ options })

onMounted(() => {
  content.loadList()
  questionnaires.loadList()
})
</script>

<template>
  <main class="grid gap-6 p-6">
    <header>
      <p class="text-sm font-semibold uppercase tracking-wide text-sm-brand">Admin observation</p>
      <h1 class="text-3xl font-bold text-sm-heading">Teacher materials</h1>
      <p class="text-sm text-sm-muted">Read/detail observation only. Teacher-owned management controls remain hidden.</p>
    </header>
    <TeacherWorkflowFeedbackState :feedback="content.state.feedback || questionnaires.state.feedback" />
    <section class="grid gap-3 lg:grid-cols-2">
      <article v-for="item in content.state.items" :key="`content-${item.id}`" class="rounded-2xl border border-sm-border bg-sm-surface p-5">
        <h2 class="font-semibold">{{ item.title }}</h2>
        <TeacherWorkflowStatusControls :status="item.status" :scan-status="item.scanStatus" :show-lifecycle="false" />
      </article>
      <article v-for="item in questionnaires.state.items" :key="`questionnaire-${item.id}`" class="rounded-2xl border border-sm-border bg-sm-surface p-5">
        <h2 class="font-semibold">{{ item.title }}</h2>
        <TeacherWorkflowStatusControls :status="item.status" :show-lifecycle="false" />
      </article>
    </section>
  </main>
</template>
