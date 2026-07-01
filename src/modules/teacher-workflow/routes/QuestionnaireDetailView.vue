<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import TeacherWorkflowFeedbackState from '../components/TeacherWorkflowFeedbackState.vue'
import TeacherWorkflowStatusControls from '../components/TeacherWorkflowStatusControls.vue'
import { QUESTION_TYPES } from '../services/questionnaireService'
import { useQuestionnaires } from '../composables/useQuestionnaires'

const route = useRoute()
const session = useAuthSessionStore()
const { state, loadDetail, save, lifecycle } = useQuestionnaires({ options: { schoolId: session.activeSchool?.id } })

function addQuestion() {
  state.draft.questions.push({ type: 'short_text', prompt: '', options: [], answer: null })
}

onMounted(() => loadDetail(route.params.questionnaireId))
</script>

<template>
  <main class="grid gap-6 p-6">
    <header>
      <p class="text-sm font-semibold uppercase tracking-wide text-sm-brand">Questionnaire authoring</p>
      <h1 class="text-3xl font-bold text-sm-heading">{{ state.detail?.title || 'New questionnaire' }}</h1>
    </header>
    <TeacherWorkflowFeedbackState :feedback="state.feedback" @retry="loadDetail(route.params.questionnaireId)" />
    <section class="grid gap-5 rounded-2xl border border-sm-border bg-sm-surface p-5">
      <TeacherWorkflowStatusControls
        v-if="state.detail"
        :status="state.detail.status"
        :pending="state.pending"
        @activate="lifecycle('status', 'active')"
        @deactivate="lifecycle('status', 'inactive')"
        @delete="lifecycle('delete')"
        @restore="lifecycle('restore')"
      />
      <ElAlert title="Response review and grading excluded" type="info" :closable="false" show-icon />
      <ElForm label-position="top" @submit.prevent="save">
        <ElFormItem label="Title" required>
          <ElInput v-model="state.draft.title" />
        </ElFormItem>
        <ElFormItem label="Description">
          <ElInput v-model="state.draft.description" type="textarea" />
        </ElFormItem>
        <div class="grid gap-3">
          <article v-for="(question, index) in state.draft.questions" :key="index" class="rounded-xl border border-sm-border p-4">
            <ElFormItem :label="`Question ${index + 1}`" required>
              <ElInput v-model="question.prompt" />
            </ElFormItem>
            <ElSelect v-model="question.type" class="w-full">
              <ElOption v-for="type in QUESTION_TYPES" :key="type" :label="type" :value="type" />
            </ElSelect>
          </article>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          <ElButton @click="addQuestion">Add question</ElButton>
          <ElButton type="primary" :loading="state.pending" @click="save">Save questionnaire</ElButton>
        </div>
      </ElForm>
    </section>
  </main>
</template>
