<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AssignedLearningSetList from '@/components/student/AssignedLearningSetList.vue'
import StudentWorkspaceNav from '@/components/student/StudentWorkspaceNav.vue'
import { useAssignedLearningSets } from '@/composables/student/useAssignedLearningSets'
import { STUDENT_SELF_SERVICE_ROUTE_NAMES } from '@/contracts/student/studentSelfServiceContract'

const router = useRouter()
const learningSets = useAssignedLearningSets()

onMounted(() => {
  learningSets.load()
})

function openLearningSet(item) {
  router.push({ name: STUDENT_SELF_SERVICE_ROUTE_NAMES.learningSetDetail, params: { learningSetId: item.id } })
}
</script>

<template>
  <main class="mx-auto w-full max-w-6xl px-4 py-6">
    <StudentWorkspaceNav />

    <AssignedLearningSetList
      :items="learningSets.state.items"
      :feedback="learningSets.state.feedback"
      :pagination="learningSets.state.meta"
      @open="openLearningSet"
      @page-change="learningSets.setPage"
    />
  </main>
</template>
