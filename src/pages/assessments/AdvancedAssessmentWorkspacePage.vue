<script setup>
import { useI18n } from 'vue-i18n'
import { ADVANCED_ASSESSMENT_ROUTE_NAMES } from '@/contracts/assessments/advancedAssessmentContract'

const { t } = useI18n()
const links = [
  { name: ADVANCED_ASSESSMENT_ROUTE_NAMES.authoring, label: 'advancedAssessment.navigation.authoring' },
  { name: ADVANCED_ASSESSMENT_ROUTE_NAMES.studentResponse, label: 'advancedAssessment.navigation.studentResponse' },
  { name: ADVANCED_ASSESSMENT_ROUTE_NAMES.reviewQueue, label: 'advancedAssessment.navigation.review' },
  { name: ADVANCED_ASSESSMENT_ROUTE_NAMES.reporting, label: 'advancedAssessment.navigation.reporting' },
]
</script>

<template>
  <main class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
    <nav class="flex flex-wrap gap-2" aria-label="Advanced assessment">
      <RouterLink v-for="link in links" :key="link.name" :to="{ name: link.name }">
        <ElButton>{{ t(link.label) }}</ElButton>
      </RouterLink>
    </nav>
    <RouterView />
  </main>
</template>
