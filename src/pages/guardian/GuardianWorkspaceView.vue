<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import GuardianLinkedStudentsList from '@/components/guardian/GuardianLinkedStudentsList.vue'
import GuardianWorkspaceNav from '@/components/guardian/GuardianWorkspaceNav.vue'
import { useGuardianLinkedStudents } from '@/composables/guardian/useGuardianLinkedStudents'
import { GUARDIAN_SELF_SERVICE_ROUTE_NAMES } from '@/contracts/guardian/guardianSelfServiceContract'

const router = useRouter()
const linkedStudents = useGuardianLinkedStudents()

onMounted(() => {
  linkedStudents.load()
})

function openStudent(item) {
  router.push({
    name: GUARDIAN_SELF_SERVICE_ROUTE_NAMES.studentDetail,
    params: { studentProfileId: item.id },
  })
}
</script>

<template>
  <main class="mx-auto w-full max-w-6xl px-4 py-6">
    <GuardianWorkspaceNav />
    <GuardianLinkedStudentsList
      :items="linkedStudents.state.items"
      :feedback="linkedStudents.state.feedback"
      :pagination="linkedStudents.state.meta"
      @open="openStudent"
      @page-change="linkedStudents.setPage"
    />
  </main>
</template>
