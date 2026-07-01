<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import TeacherWorkflowFeedbackState from '../components/TeacherWorkflowFeedbackState.vue'
import TeacherWorkflowStatusControls from '../components/TeacherWorkflowStatusControls.vue'
import { useTeacherContent } from '../composables/useTeacherContent'

const route = useRoute()
const session = useAuthSessionStore()
const { state, downloadable, loadDetail, updateDetail, lifecycle, downloadDetail } = useTeacherContent({
  options: { schoolId: session.activeSchool?.id },
})

onMounted(() => loadDetail(route.params.contentItemId))
</script>

<template>
  <main class="grid gap-6 p-6">
    <header>
      <p class="text-sm font-semibold uppercase tracking-wide text-sm-brand">Teacher content</p>
      <h1 class="text-3xl font-bold text-sm-heading">{{ state.detail?.title || 'Content detail' }}</h1>
    </header>
    <TeacherWorkflowFeedbackState :feedback="state.feedback" @retry="loadDetail(route.params.contentItemId)" />
    <section v-if="state.detail" class="grid gap-5 rounded-2xl border border-sm-border bg-sm-surface p-5">
      <TeacherWorkflowStatusControls
        :status="state.detail.status"
        :scan-status="state.detail.scanStatus"
        :pending="state.pending"
        @activate="lifecycle('status', 'active')"
        @deactivate="lifecycle('status', 'inactive')"
        @delete="lifecycle('delete')"
        @restore="lifecycle('restore')"
      />
      <ElForm label-position="top">
        <ElFormItem label="Title">
          <ElInput v-model="state.detail.title" />
        </ElFormItem>
        <ElFormItem label="Description">
          <ElInput v-model="state.detail.description" type="textarea" />
        </ElFormItem>
        <div class="flex flex-wrap gap-2">
          <ElButton type="primary" :loading="state.pending" @click="updateDetail(state.detail)">Save metadata</ElButton>
          <ElButton :disabled="!downloadable" @click="downloadDetail">Download clean file</ElButton>
        </div>
      </ElForm>
    </section>
  </main>
</template>
