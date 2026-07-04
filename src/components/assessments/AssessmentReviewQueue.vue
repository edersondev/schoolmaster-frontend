<script setup>
import AdvancedAssessmentStatusBadges from './AdvancedAssessmentStatusBadges.vue'

defineProps({
  items: { type: Array, default: () => [] },
})
const emit = defineEmits(['select'])
</script>

<template>
  <div class="space-y-3">
    <article v-for="item in items" :key="item.id" class="rounded border border-sm-border p-4">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 class="font-semibold text-sm-heading">{{ item.studentDisplayName || item.id }}</h3>
          <p class="text-sm text-sm-muted">{{ item.submittedAt || 'Not submitted' }}</p>
        </div>
        <AdvancedAssessmentStatusBadges :grading-status="item.gradingStatus" />
      </div>
      <ElButton class="mt-3" @click="emit('select', item)">Open</ElButton>
    </article>
  </div>
</template>
