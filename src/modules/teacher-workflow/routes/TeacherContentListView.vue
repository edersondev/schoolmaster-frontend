<script setup>
import { onMounted } from 'vue'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import TeacherContentUploadForm from '../components/TeacherContentUploadForm.vue'
import TeacherWorkflowFeedbackState from '../components/TeacherWorkflowFeedbackState.vue'
import TeacherWorkflowStatusControls from '../components/TeacherWorkflowStatusControls.vue'
import { useTeacherContent } from '../composables/useTeacherContent'
import { TEACHER_WORKFLOW_ROUTE_NAMES } from './routeNames'

const session = useAuthSessionStore()
const options = { schoolId: session.activeSchool?.id }
const { state, loadList, upload } = useTeacherContent({ options })

onMounted(() => loadList())
</script>

<template>
  <main class="grid gap-6 p-6">
    <header>
      <p class="text-sm font-semibold uppercase tracking-wide text-sm-brand">Teacher workspace</p>
      <h1 class="text-3xl font-bold text-sm-heading">Teacher content</h1>
    </header>
    <TeacherWorkflowFeedbackState :feedback="state.feedback" @retry="loadList" />
    <TeacherContentUploadForm v-model="state.uploadDraft" :pending="state.pending" @submit="upload" />
    <section class="grid gap-3">
      <article
        v-for="item in state.items"
        :key="item.id"
        class="rounded-2xl border border-sm-border bg-sm-surface p-5 shadow-sm"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="text-xl font-semibold text-sm-heading">{{ item.title }}</h2>
            <p class="text-sm text-sm-muted">{{ item.description || item.contentType }}</p>
          </div>
          <TeacherWorkflowStatusControls :status="item.status" :scan-status="item.scanStatus" :show-lifecycle="false" />
        </div>
        <RouterLink :to="{ name: TEACHER_WORKFLOW_ROUTE_NAMES.contentDetail, params: { contentItemId: item.id } }">
          <ElButton class="mt-4">Open detail</ElButton>
        </RouterLink>
      </article>
    </section>
  </main>
</template>
