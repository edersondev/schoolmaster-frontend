<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAcademicPeriodScope } from '@/composables/admin-system/useAcademicPeriodScope'
import { useTeacherAssignments } from '@/composables/admin-system/useTeacherAssignments'
import AcademicPeriodScopeSelector from '@/components/admin-system/shared/AcademicPeriodScopeSelector.vue'
import TeacherAssignmentForm from '@/components/admin-system/teacher-assignments/TeacherAssignmentForm.vue'
import TeacherAssignmentTable from '@/components/admin-system/teacher-assignments/TeacherAssignmentTable.vue'
import AdminSafeFeedbackState from '@/components/admin-system/shared/AdminSafeFeedbackState.vue'

const router = useRouter()
const scope = useAcademicPeriodScope()
const assignments = useTeacherAssignments()
const showFeedback = computed(() => !['ready'].includes(assignments.status.value))

async function create() {
  const record = await assignments.create()
  if (record?.id) router.push({ name: 'teacherAssignmentDetail', params: { teacherAssignmentId: record.id }, query: { academicPeriodId: assignments.form.academicPeriodId } })
}
</script>

<template>
  <main class="space-y-5">
    <header>
      <h1 class="text-2xl font-semibold text-sm-text">Teacher assignments</h1>
      <p class="text-sm text-sm-muted">Admin-only academic-period assignments</p>
    </header>
    <AcademicPeriodScopeSelector
      :model-value="scope.selectedAcademicPeriodId.value"
      :periods="scope.periods.value"
      :loading="scope.loading.value"
      :blocked="scope.blocked.value"
      @change="scope.selectPeriod"
      @retry="scope.load"
    />
    <TeacherAssignmentForm v-model="assignments.form" :field-errors="assignments.fieldErrors.value" @submit="create" />
    <AdminSafeFeedbackState v-if="showFeedback" :state="assignments.status.value" :feedback="assignments.error.value" @retry="assignments.load()" />
    <TeacherAssignmentTable
      v-else
      :rows="assignments.items.value"
      @view="router.push({ name: 'teacherAssignmentDetail', params: { teacherAssignmentId: $event.id }, query: $route.query })"
    />
  </main>
</template>
