<script setup>
import { computed, onMounted, shallowRef } from 'vue'
import { useRoute } from 'vue-router'
import { useTeacherAssignments } from '@/composables/admin-system/useTeacherAssignments'
import TeacherAssignmentTable from '@/components/admin-system/teacher-assignments/TeacherAssignmentTable.vue'
import AdminLifecycleConfirmDialog from '@/components/ui/admin/AdminLifecycleConfirmDialog.vue'
import AdminSafeFeedbackState from '@/components/admin-system/shared/AdminSafeFeedbackState.vue'

const route = useRoute()
const assignments = useTeacherAssignments({ autoLoad: false })
const assignmentId = computed(() => route.params.teacherAssignmentId)
const deactivateOpen = shallowRef(false)

async function submitDeactivate() {
  await assignments.deactivate(assignmentId.value)
  await assignments.loadDetail(assignmentId.value)
  deactivateOpen.value = false
}

onMounted(() => assignments.loadDetail(assignmentId.value))
</script>

<template>
  <main class="space-y-5">
    <AdminSafeFeedbackState v-if="assignments.status.value !== 'ready'" :state="assignments.status.value" :feedback="assignments.error.value" @retry="assignments.loadDetail(assignmentId)" />
    <template v-else>
      <TeacherAssignmentTable :rows="[assignments.detail.value]" />
      <div class="flex justify-end">
        <ElButton type="danger" plain @click="deactivateOpen = true">
          Deactivate assignment
        </ElButton>
      </div>
      <AdminLifecycleConfirmDialog
        :open="deactivateOpen"
        v-model:values="assignments.deactivateForm"
        title="Deactivate assignment"
        :field-errors="assignments.fieldErrors.value"
        @cancel="deactivateOpen = false"
        @submit="submitDeactivate"
      />
    </template>
  </main>
</template>
