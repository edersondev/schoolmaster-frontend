<script setup>
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import TeacherWorkflowFeedbackState from '../components/TeacherWorkflowFeedbackState.vue'
import TeacherWorkflowImportEditor from '../components/TeacherWorkflowImportEditor.vue'
import { TEACHER_WORKFLOW_CAPABILITIES, hasCapability } from '../services/teacherWorkflowContract'
import { useTeacherWorkflowImports } from '../composables/useTeacherWorkflowImports'

const session = useAuthSessionStore()
const canImport = hasCapability(session, TEACHER_WORKFLOW_CAPABILITIES.adminImport)
const { state, rowCount, parseJson, submit } = useTeacherWorkflowImports({
  options: { schoolId: session.activeSchool?.id },
  canImport,
})
</script>

<template>
  <main class="grid gap-6 p-6">
    <header>
      <p class="text-sm font-semibold uppercase tracking-wide text-sm-brand">Admin workflow</p>
      <h1 class="text-3xl font-bold text-sm-heading">Grade and attendance imports</h1>
    </header>
    <TeacherWorkflowFeedbackState :feedback="state.feedback" />
    <TeacherWorkflowImportEditor
      v-model="state"
      :row-count="rowCount"
      :pending="state.pending"
      @parse="parseJson"
      @submit="submit"
    />
  </main>
</template>
