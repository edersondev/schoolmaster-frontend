<script setup>
import { onMounted } from 'vue'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import LearningSetForm from '../components/LearningSetForm.vue'
import TeacherWorkflowFeedbackState from '../components/TeacherWorkflowFeedbackState.vue'
import TeacherWorkflowStatusControls from '../components/TeacherWorkflowStatusControls.vue'
import { useLearningSets } from '../composables/useLearningSets'
import { TEACHER_WORKFLOW_ROUTE_NAMES } from './routeNames'

const session = useAuthSessionStore()
const { state, loadList, create } = useLearningSets({ options: { schoolId: session.activeSchool?.id } })

onMounted(() => loadList())
</script>

<template>
  <main class="grid gap-6 p-6">
    <header>
      <p class="text-sm font-semibold uppercase tracking-wide text-sm-brand">Teacher workspace</p>
      <h1 class="text-3xl font-bold text-sm-heading">Learning sets</h1>
    </header>
    <TeacherWorkflowFeedbackState :feedback="state.feedback" @retry="loadList" />
    <LearningSetForm
      v-model="state.draft"
      :disabled="!state.gates.rosterAwareLearningSetCreate"
      :pending="state.pending"
      @submit="create"
    />
    <section class="grid gap-3">
      <article v-for="item in state.items" :key="item.id" class="rounded-2xl border border-sm-border bg-sm-surface p-5">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <h2 class="text-xl font-semibold text-sm-heading">{{ item.title }}</h2>
          <TeacherWorkflowStatusControls :status="item.status" :show-lifecycle="false" />
        </div>
        <ElTag v-if="item.hasLegacyDirectAssignments" class="mt-3" type="warning">Read-only legacy audience</ElTag>
        <RouterLink :to="{ name: TEACHER_WORKFLOW_ROUTE_NAMES.learningSetDetail, params: { learningSetId: item.id } }">
          <ElButton class="mt-4">Open detail</ElButton>
        </RouterLink>
      </article>
    </section>
  </main>
</template>
