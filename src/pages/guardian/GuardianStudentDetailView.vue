<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import GuardianFeedbackState from '@/components/guardian/GuardianFeedbackState.vue'
import GuardianStudentDetailSummary from '@/components/guardian/GuardianStudentDetailSummary.vue'
import GuardianWorkspaceNav from '@/components/guardian/GuardianWorkspaceNav.vue'
import { useGuardianStudentDetail } from '@/composables/guardian/useGuardianStudentDetail'
import { GUARDIAN_SELF_SERVICE_ROUTE_NAMES } from '@/contracts/guardian/guardianSelfServiceContract'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const detail = useGuardianStudentDetail({ route })

onMounted(() => {
  detail.load()
})
</script>

<template>
  <main class="mx-auto w-full max-w-6xl px-4 py-6">
    <GuardianWorkspaceNav :student-profile-id="detail.studentProfileId.value" />
    <ElButton
      class="mb-4"
      plain
      @click="router.push({ name: GUARDIAN_SELF_SERVICE_ROUTE_NAMES.linkedStudents })"
    >
      {{ t('guardianSelfService.actions.back') }}
    </ElButton>
    <GuardianFeedbackState :feedback="detail.state.feedback" />
    <GuardianStudentDetailSummary :student="detail.state.student" />
  </main>
</template>
