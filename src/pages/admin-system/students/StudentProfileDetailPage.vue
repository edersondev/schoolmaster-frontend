<script setup>
import { computed, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { useStudentProfiles } from '@/composables/admin-system/useStudentProfiles'
import { useStudentProfileLifecycle } from '@/composables/admin-system/useStudentProfileLifecycle'
import { useStudentTransfer } from '@/composables/admin-system/useStudentTransfer'
import { useStudentEnrollmentRosterPermissions } from '@/composables/admin-system/useStudentEnrollmentRosterPermissions'
import StudentProfileSummaryPanel from '@/components/admin-system/students/StudentProfileSummaryPanel.vue'
import StudentEnrollmentStatusPanel from '@/components/admin-system/students/StudentEnrollmentStatusPanel.vue'
import StudentGuardianAssociationsPanel from '@/components/admin-system/students/StudentGuardianAssociationsPanel.vue'
import StudentTransferDialog from '@/components/admin-system/students/StudentTransferDialog.vue'
import AdminDetailPage from '@/components/ui/admin/AdminDetailPage.vue'
import { createReturnToListLocation } from '@/router/modules/administration-route'

const route = useRoute()
const { t } = useI18n()
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
const activeTab = shallowRef('student')
const studentId = computed(() => String(route.params.studentProfileId ?? ''))
const tenantId = computed(() => sessionStore.activeSchool?.id ?? null)
const returnTo = computed(() => createReturnToListLocation(route, 'studentProfilesList'))
const title = computed(
  () => profiles.detail.value?.fullName ?? t('studentEnrollmentRoster.students.detail'),
)

async function submitStatus() {
  const result = await lifecycle.submit(studentId.value)
  if (result?.studentProfile) profiles.detail.value = result.studentProfile
}

async function submitTransfer() {
  const result = await transfer.submit(studentId.value)
  if (result?.studentProfile) profiles.detail.value = result.studentProfile
  transferOpen.value = false
}

watch(
  [studentId, tenantId],
  ([id, schoolId]) => {
    if (id && schoolId) profiles.loadDetail(id)
  },
  { immediate: true },
)
</script>

<template>
  <AdminDetailPage
    :title="title"
    :status="profiles.status.value"
    :feedback="profiles.error.value"
    :record-status="profiles.detail.value?.status"
    :return-to="returnTo"
    @retry="profiles.loadDetail(studentId)"
  >
    <template #actions>
      <ElButton
        v-if="profiles.detail.value"
        type="warning"
        :disabled="!permissions.canManageStudents.value"
        @click="transferOpen = true"
      >
        {{ t('studentEnrollmentRoster.students.transfer') }}
      </ElButton>
    </template>

    <template v-if="profiles.detail.value">
      <ElTabs v-model="activeTab" class="student-detail-tabs">
        <ElTabPane :label="t('studentGuardianTabs.tabs.student')" name="student">
          <StudentProfileSummaryPanel :student="profiles.detail.value" />
          <StudentEnrollmentStatusPanel
            v-model="lifecycle.form"
            :can-manage="permissions.canManageStudents.value"
            :pending="lifecycle.pending.value"
            :field-errors="lifecycle.fieldErrors.value"
            :feedback="lifecycle.feedback.value"
            @submit="submitStatus"
          />
        </ElTabPane>
        <ElTabPane :label="t('studentGuardianTabs.tabs.guardians')" name="guardians">
          <StudentGuardianAssociationsPanel
            :associations="profiles.detail.value.guardianAssociations"
          />
        </ElTabPane>
      </ElTabs>
    </template>
  </AdminDetailPage>

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
