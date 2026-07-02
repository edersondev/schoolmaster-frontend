<script setup>
import { useI18n } from 'vue-i18n'
import StudentFeedbackState from './StudentFeedbackState.vue'
import StudentStatusControls from './StudentStatusControls.vue'

defineProps({
  items: { type: Array, default: () => [] },
  feedback: { type: Object, default: null },
  pagination: { type: Object, default: null },
})

const emit = defineEmits(['open', 'pageChange'])
const { t } = useI18n()
</script>

<template>
  <section class="space-y-4" aria-labelledby="assigned-learning-sets-title">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <h2 id="assigned-learning-sets-title" class="text-xl font-semibold text-slate-950">
        {{ t('studentSelfService.learningSets.title') }}
      </h2>
      <StudentStatusControls :pagination="pagination" @page-change="emit('pageChange', $event)" />
    </div>
    <StudentFeedbackState :feedback="feedback" />
    <div class="grid gap-3">
      <article
        v-for="item in items"
        :key="item.id"
        class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div class="min-w-0">
            <h3 class="break-words text-base font-semibold text-slate-950">{{ item.title }}</h3>
            <p class="text-sm text-slate-600">
              {{ t('studentSelfService.labels.publishedAt') }}: {{ item.publishedAt || t('studentSelfService.labels.unavailable') }}
            </p>
          </div>
          <StudentStatusControls :status="item.status" />
        </div>
        <ElButton class="mt-4" type="primary" plain @click="emit('open', item)">
          {{ t('studentSelfService.actions.open') }}
        </ElButton>
      </article>
    </div>
  </section>
</template>
