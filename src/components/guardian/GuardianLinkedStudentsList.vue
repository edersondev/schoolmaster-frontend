<script setup>
import { useI18n } from 'vue-i18n'
import GuardianFeedbackState from './GuardianFeedbackState.vue'
import GuardianStatusControls from './GuardianStatusControls.vue'

defineProps({
  items: { type: Array, default: () => [] },
  feedback: { type: Object, default: null },
  pagination: { type: Object, default: null },
})

const emit = defineEmits(['open', 'pageChange'])
const { t } = useI18n()
</script>

<template>
  <section class="space-y-4" aria-labelledby="guardian-linked-students-title">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <h2 id="guardian-linked-students-title" class="text-xl font-semibold text-slate-950">
        {{ t('guardianSelfService.linkedStudents.title') }}
      </h2>
      <GuardianStatusControls :pagination="pagination" @page-change="emit('pageChange', $event)" />
    </div>
    <GuardianFeedbackState :feedback="feedback" />
    <div class="grid gap-3">
      <article
        v-for="item in items"
        :key="item.id"
        class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div class="min-w-0">
            <h3 class="break-words text-base font-semibold text-slate-950">{{ item.fullName }}</h3>
            <p class="text-sm text-slate-600">
              {{ t('guardianSelfService.labels.registrationNumber') }}:
              {{ item.registrationNumber || t('guardianSelfService.labels.unavailable') }}
            </p>
          </div>
          <GuardianStatusControls :status="item.status" :relationship-label="item.relationshipLabel" />
        </div>
        <ElButton
          class="mt-4 !border-slate-950 !bg-slate-950 !text-white"
          type="primary"
          @click="emit('open', item)"
        >
          {{ t('guardianSelfService.actions.open') }}
        </ElButton>
      </article>
    </div>
  </section>
</template>
