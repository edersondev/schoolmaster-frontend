<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { REPORT_DEFINITION_STATES } from '@/contracts/reporting/reportingContract'
import ReportingStatusBadges from './ReportingStatusBadges.vue'

const props = defineProps({
  definition: { type: Object, default: null },
})
const emit = defineEmits(['edit', 'action', 'request'])
const { t } = useI18n()
const actions = computed(() => {
  if (!props.definition) return []
  if (props.definition.lifecycleState === REPORT_DEFINITION_STATES.active) return ['deactivate', 'delete']
  if (props.definition.lifecycleState === REPORT_DEFINITION_STATES.deleted) return ['restore']
  return ['activate', 'delete']
})
</script>

<template>
  <section v-if="definition" class="space-y-4 rounded-md border border-slate-200 bg-white p-4">
    <header class="flex items-start justify-between gap-3">
      <div>
        <h2 class="text-lg font-semibold text-slate-950">{{ definition.name }}</h2>
        <p class="text-sm text-slate-600">{{ definition.description }}</p>
      </div>
      <ReportingStatusBadges :lifecycle-state="definition.lifecycleState" />
    </header>
    <dl class="grid gap-3 text-sm md:grid-cols-4">
      <div><dt class="text-slate-500">{{ t('reporting.labels.fields') }}</dt><dd>{{ definition.fields.length }}</dd></div>
      <div><dt class="text-slate-500">{{ t('reporting.labels.filters') }}</dt><dd>{{ definition.filters.length }}</dd></div>
      <div><dt class="text-slate-500">{{ t('reporting.labels.grouping') }}</dt><dd>{{ definition.grouping.length }}</dd></div>
      <div><dt class="text-slate-500">{{ t('reporting.labels.sorting') }}</dt><dd>{{ definition.sorting.length }}</dd></div>
    </dl>
    <div class="flex flex-wrap gap-2">
      <ElButton @click="emit('edit', definition)">{{ t('reporting.actions.edit') }}</ElButton>
      <ElButton v-if="definition.lifecycleState === 'active'" type="primary" @click="emit('request', definition)">{{ t('reporting.actions.request') }}</ElButton>
      <ElButton v-for="action in actions" :key="action" @click="emit('action', action)">{{ t(`reporting.actions.${action}`) }}</ElButton>
    </div>
  </section>
</template>
