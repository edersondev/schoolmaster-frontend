<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useClassSections } from '@/composables/admin-system/useClassSections'
import { useRosterMemberships } from '@/composables/admin-system/useRosterMemberships'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import ClassSectionSummaryPanel from '@/components/admin-system/class-sections/ClassSectionSummaryPanel.vue'
import ClassSectionForm from '@/components/admin-system/class-sections/ClassSectionForm.vue'
import RosterMembershipTable from '@/components/admin-system/class-sections/RosterMembershipTable.vue'
import RosterMembershipBatchPanel from '@/components/admin-system/class-sections/RosterMembershipBatchPanel.vue'
import AdminSafeFeedbackState from '@/components/admin-system/shared/AdminSafeFeedbackState.vue'

const route = useRoute()
const sessionStore = useAuthSessionStore()
const sections = useClassSections({ autoLoad: false })
const memberships = useRosterMemberships({
  serviceOptions: () => ({ schoolId: sessionStore.activeSchool?.id }),
})
const classSectionId = computed(() => route.params.classSectionId)
const showFeedback = computed(() => !['ready'].includes(sections.status.value))

async function save() {
  await sections.save(classSectionId.value)
  await sections.loadDetail(classSectionId.value)
}

async function addMemberships() {
  await memberships.submitAdd(classSectionId.value)
  await memberships.load(classSectionId.value, { academicPeriodId: route.query.academicPeriodId })
}

async function endMemberships() {
  await memberships.submitEnd(classSectionId.value)
  await memberships.load(classSectionId.value, { academicPeriodId: route.query.academicPeriodId })
}

onMounted(async () => {
  await sections.loadDetail(classSectionId.value)
  await memberships.load(classSectionId.value, { academicPeriodId: route.query.academicPeriodId })
})
</script>

<template>
  <main class="space-y-5">
    <AdminSafeFeedbackState v-if="showFeedback" :state="sections.status.value" :feedback="sections.error.value" @retry="sections.loadDetail(classSectionId)" />
    <template v-else>
      <ClassSectionSummaryPanel :class-section="sections.detail.value" :conflict="sections.error.value" />
      <ClassSectionForm v-model="sections.form" :include-period="false" :field-errors="sections.fieldErrors.value" @submit="save" />
      <RosterMembershipTable :rows="memberships.items.value" @select="memberships.setMembershipSelection" />
      <RosterMembershipBatchPanel v-model="memberships.batch" mode="add" :selected-count="memberships.batch.studentProfileIds.length" :field-errors="memberships.fieldErrors.value" @submit="addMemberships" />
      <RosterMembershipBatchPanel v-model="memberships.batch" mode="end" :selected-count="memberships.selectedMembershipIds.value.length" :field-errors="memberships.fieldErrors.value" @submit="endMemberships" />
    </template>
  </main>
</template>
