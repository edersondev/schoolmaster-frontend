<script setup>
import TeacherWorkflowFeedbackState from '../components/TeacherWorkflowFeedbackState.vue'

const feedback = {
  type: 'unsupported-contract',
  message:
    'Admin academic record observation is limited to same-school read/detail and closed-period correction where backend authorization approves it.',
}
</script>

<template>
  <main class="grid gap-6 p-6">
    <header>
      <p class="text-sm font-semibold uppercase tracking-wide text-sm-brand">Admin observation</p>
      <h1 class="text-3xl font-bold text-sm-heading">Academic records</h1>
    </header>
    <TeacherWorkflowFeedbackState :feedback="feedback" />
  </main>
</template>
