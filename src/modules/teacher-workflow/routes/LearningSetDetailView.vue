<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import TeacherWorkflowFeedbackState from '../components/TeacherWorkflowFeedbackState.vue'
import TeacherWorkflowStatusControls from '../components/TeacherWorkflowStatusControls.vue'
import { useLearningSets } from '../composables/useLearningSets'

const route = useRoute()
const session = useAuthSessionStore()
const { state, loadDetail, lifecycle } = useLearningSets({ options: { schoolId: session.activeSchool?.id } })

onMounted(() => loadDetail(route.params.learningSetId))
</script>

<template>
  <main class="grid gap-6 p-6">
    <header>
      <p class="text-sm font-semibold uppercase tracking-wide text-sm-brand">Learning set</p>
      <h1 class="text-3xl font-bold text-sm-heading">{{ state.detail?.title || 'Learning-set detail' }}</h1>
    </header>
    <TeacherWorkflowFeedbackState :feedback="state.feedback" @retry="loadDetail(route.params.learningSetId)" />
    <section v-if="state.detail" class="grid gap-4 rounded-2xl border border-sm-border bg-sm-surface p-5">
      <TeacherWorkflowStatusControls
        :status="state.detail.status"
        :pending="state.pending"
        @activate="lifecycle('status', 'active')"
        @deactivate="lifecycle('status', 'inactive')"
        @delete="lifecycle('delete')"
        @restore="lifecycle('restore')"
      />
      <dl class="grid gap-3 text-sm">
        <div class="grid gap-1 rounded-xl border border-sm-border p-3 sm:grid-cols-[10rem_1fr]">
          <dt class="font-semibold text-sm-muted">Academic period</dt>
          <dd class="min-w-0 break-words">{{ state.detail.academicPeriodId }}</dd>
        </div>
        <div class="grid gap-1 rounded-xl border border-sm-border p-3 sm:grid-cols-[10rem_1fr]">
          <dt class="font-semibold text-sm-muted">Audience</dt>
          <dd class="min-w-0">
            <ElTag v-if="state.detail.hasLegacyDirectAssignments" type="warning" class="max-w-full whitespace-normal">
              Read-only legacy direct assignments
            </ElTag>
            <span v-else class="break-words">
              {{ state.detail.rosterAssignment?.class_section_id || 'Roster-aware audience' }}
            </span>
          </dd>
        </div>
        <div class="grid gap-1 rounded-xl border border-sm-border p-3 sm:grid-cols-[10rem_1fr]">
          <dt class="font-semibold text-sm-muted">Entries</dt>
          <dd>{{ state.detail.entries.length }}</dd>
        </div>
      </dl>
    </section>
  </main>
</template>
