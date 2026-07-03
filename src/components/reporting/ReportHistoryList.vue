<script setup>
import { Refresh } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import ReportingFeedbackState from './ReportingFeedbackState.vue'
import ReportingStatusBadges from './ReportingStatusBadges.vue'

defineProps({
  items: { type: Array, default: () => [] },
  feedback: { type: Object, default: null },
  emptyState: { type: Object, default: null },
  pagination: { type: Object, default: () => ({ page: 1, perPage: 25, total: 0 }) },
})
const emit = defineEmits(['select', 'refresh', 'page-change'])
const { t } = useI18n()
</script>

<template>
  <section class="space-y-4">
    <header class="flex items-center justify-between gap-3">
      <h2 class="text-lg font-semibold text-slate-950">{{ t('reporting.history.title') }}</h2>
      <ElButton :icon="Refresh" @click="emit('refresh')">{{ t('reporting.actions.refresh') }}</ElButton>
    </header>
    <ReportingFeedbackState :feedback="feedback || emptyState" />
    <div class="overflow-hidden rounded-md border border-slate-200 bg-white">
      <table class="w-full table-fixed text-left text-sm">
        <thead class="bg-slate-50 text-slate-600">
          <tr>
            <th class="px-4 py-3">{{ t('reporting.labels.reportType') }}</th>
            <th class="px-4 py-3">{{ t('reporting.labels.status') }}</th>
            <th class="px-4 py-3">{{ t('reporting.labels.source') }}</th>
            <th class="px-4 py-3">{{ t('reporting.labels.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id" class="border-t border-slate-100">
            <td class="px-4 py-3 font-medium text-slate-950">{{ item.reportType }}</td>
            <td class="px-4 py-3"><ReportingStatusBadges :status="item.generationStatus" :deleted-at="item.deletedAt" /></td>
            <td class="px-4 py-3 text-slate-600">{{ item.reportSource }}</td>
            <td class="px-4 py-3"><ElButton link type="primary" @click="emit('select', item)">{{ t('reporting.actions.open') }}</ElButton></td>
          </tr>
        </tbody>
      </table>
    </div>
    <ElPagination
      layout="prev, pager, next"
      :current-page="pagination.page"
      :page-size="pagination.perPage"
      :total="pagination.total"
      @current-change="emit('page-change', $event)"
    />
  </section>
</template>
