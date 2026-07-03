<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import GuardianContactPanel from '@/components/guardian/GuardianContactPanel.vue'
import GuardianFeedbackState from '@/components/guardian/GuardianFeedbackState.vue'
import GuardianStudentPrimaryContactPanel from '@/components/guardian/GuardianStudentPrimaryContactPanel.vue'
import GuardianWorkspaceNav from '@/components/guardian/GuardianWorkspaceNav.vue'
import { useGuardianContactView } from '@/composables/guardian/useGuardianContactView'

const route = useRoute()
const contact = useGuardianContactView({ route })

onMounted(() => {
  contact.load()
})
</script>

<template>
  <main class="mx-auto w-full max-w-6xl space-y-4 px-4 py-6">
    <GuardianWorkspaceNav :student-profile-id="contact.studentProfileId.value" />
    <GuardianFeedbackState :feedback="contact.state.feedback" />
    <div v-if="contact.state.contactView" class="grid gap-4 md:grid-cols-2">
      <GuardianContactPanel
        :contact="contact.state.contactView.guardianContact"
        :relationship-label="contact.state.contactView.relationshipLabel"
      />
      <GuardianStudentPrimaryContactPanel :contact="contact.state.contactView.studentPrimaryContact" />
    </div>
  </main>
</template>
