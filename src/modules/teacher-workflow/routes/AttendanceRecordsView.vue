<script setup>
import { ref } from 'vue'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import CorrectionReasonDialog from '../components/CorrectionReasonDialog.vue'
import TeacherWorkflowFeedbackState from '../components/TeacherWorkflowFeedbackState.vue'
import TeacherWorkflowStatusControls from '../components/TeacherWorkflowStatusControls.vue'
import { useAttendance } from '../composables/useAttendance'
import { ATTENDANCE_STATUSES } from '../services/attendanceService'

const session = useAuthSessionStore()
const correctionOpen = ref(false)
const { state, loadList, create, correct } = useAttendance({ options: { schoolId: session.activeSchool?.id } })
</script>

<template>
  <main class="grid gap-6 p-6">
    <header>
      <p class="text-sm font-semibold uppercase tracking-wide text-sm-brand">Teacher workspace</p>
      <h1 class="text-3xl font-bold text-sm-heading">Attendance</h1>
    </header>
    <TeacherWorkflowFeedbackState :feedback="state.feedback" @retry="loadList" />
    <section class="grid gap-4 rounded-2xl border border-sm-border bg-sm-surface p-5">
      <ElAlert
        v-if="!state.gates.scopedAttendanceList"
        title="Scoped attendance list blocked"
        description="OpenAPI must document academic-period or roster filters before scoped lists load."
        type="warning"
        :closable="false"
        show-icon
      />
      <ElForm label-position="top">
        <div class="grid gap-3 md:grid-cols-2">
          <ElFormItem label="Student profile ID" required>
            <ElInput v-model="state.draft.studentProfileId" />
          </ElFormItem>
          <ElFormItem label="Academic period ID" required>
            <ElInput v-model="state.draft.academicPeriodId" />
          </ElFormItem>
          <ElFormItem label="Attendance date" required>
            <ElInput v-model="state.draft.attendanceDate" placeholder="YYYY-MM-DD" />
          </ElFormItem>
          <ElFormItem label="Status" required>
            <ElSelect v-model="state.draft.attendanceStatus" class="w-full">
              <ElOption v-for="status in ATTENDANCE_STATUSES" :key="status" :label="status" :value="status" />
            </ElSelect>
          </ElFormItem>
        </div>
        <ElButton type="primary" :loading="state.pending" @click="create">Record attendance</ElButton>
      </ElForm>
    </section>
    <section v-if="state.detail" class="grid gap-3 rounded-2xl border border-sm-border bg-sm-surface p-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-xl font-semibold">Current attendance: {{ state.detail.currentValue }}</h2>
        <TeacherWorkflowStatusControls :status="state.detail.status" :show-lifecycle="false" />
      </div>
      <ElButton @click="correctionOpen = true">Correct attendance</ElButton>
    </section>
    <CorrectionReasonDialog
      v-if="state.detail"
      v-model="correctionOpen"
      v-model:draft="state.correctionDraft"
      :current-value="state.detail.currentValue"
      :original-value="state.detail.originalValue"
      value-type="attendance"
      :pending="state.pending"
      @submit="correct"
    />
  </main>
</template>
