<script setup>
import { computed, onMounted, shallowRef } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { useStudentProfiles } from '@/composables/admin-system/useStudentProfiles'
import { useStudentProfileLifecycle } from '@/composables/admin-system/useStudentProfileLifecycle'
import { useStudentTransfer } from '@/composables/admin-system/useStudentTransfer'
import { useStudentEnrollmentRosterPermissions } from '@/composables/admin-system/useStudentEnrollmentRosterPermissions'
import StudentProfileSummaryPanel from '@/components/admin-system/students/StudentProfileSummaryPanel.vue'
import StudentEnrollmentStatusPanel from '@/components/admin-system/students/StudentEnrollmentStatusPanel.vue'
import StudentTransferDialog from '@/components/admin-system/students/StudentTransferDialog.vue'
import AdminSafeFeedbackState from '@/components/admin-system/shared/AdminSafeFeedbackState.vue'

const route = useRoute()
const sessionStore = useAuthSessionStore()
const profiles = useStudentProfiles({ autoLoad: false })
const permissions = useStudentEnrollmentRosterPermissions()
const lifecycle = useStudentProfileLifecycle({
  serviceOptions: () => ({ schoolId: sessionStore.activeSchool?.id }),
})
const transfer = useStudentTransfer({
  serviceOptions: () => ({ schoolId: sessionStore.activeSchool?.id }),
})
const transferOpen = shallowRef(false)
const studentId = computed(() => route.params.studentProfileId)
const showFeedback = computed(() => !['ready'].includes(profiles.status.value))

async function submitStatus() {
  const result = await lifecycle.submit(studentId.value)
  if (result?.studentProfile) profiles.detail.value = result.studentProfile
}

async function submitTransfer() {
  const result = await transfer.submit(studentId.value)
  if (result?.studentProfile) profiles.detail.value = result.studentProfile
  transferOpen.value = false
}

onMounted(() => profiles.loadDetail(studentId.value))
</script>

<template>
  <main class="space-y-5">
    <AdminSafeFeedbackState v-if="showFeedback" :state="profiles.status.value" :feedback="profiles.error.value" @retry="profiles.loadDetail(studentId)" />
    <template v-else>
      <StudentProfileSummaryPanel :student="profiles.detail.value" />
      <StudentEnrollmentStatusPanel
        v-model="lifecycle.form"
        :can-manage="permissions.canManageStudents.value"
        :pending="lifecycle.pending.value"
        :field-errors="lifecycle.fieldErrors.value"
        :feedback="lifecycle.feedback.value"
        @submit="submitStatus"
      />
      <div class="flex justify-end">
        <ElButton type="warning" :disabled="!permissions.canManageStudents.value" @click="transferOpen = true">
          Transfer
        </ElButton>
      </div>
      <StudentTransferDialog
        v-model:open="transferOpen"
        v-model:values="transfer.form"
        :pending="transfer.pending.value"
        :field-errors="transfer.fieldErrors.value"
        :feedback="transfer.feedback.value"
        @submit="submitTransfer"
        @cancel="transferOpen = false"
      />
    </template>
  </main>
</template>
