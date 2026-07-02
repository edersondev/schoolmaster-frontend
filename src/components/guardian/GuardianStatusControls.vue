<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, default: '' },
  relationshipLabel: { type: String, default: '' },
  pagination: { type: Object, default: null },
})

const emit = defineEmits(['pageChange'])

const statusType = computed(() => {
  if (['active', 'published', 'present', 'available', 'complete'].includes(props.status)) return 'success'
  if (['pending', 'in_progress', 'partial', 'late'].includes(props.status)) return 'warning'
  if (['failed', 'absent', 'inactive', 'unavailable', 'blocked'].includes(props.status)) return 'danger'
  return 'info'
})
const statusClasses = computed(() => ({
  success: 'border-emerald-300 bg-emerald-100 text-emerald-950',
  warning: 'border-amber-300 bg-amber-100 text-amber-950',
  danger: 'border-red-300 bg-red-100 text-red-950',
  info: 'border-slate-300 bg-slate-100 text-slate-950',
})[statusType.value])

const currentPage = computed(() => Number(props.pagination?.page) || 1)
const perPage = computed(() => Number(props.pagination?.perPage) || 25)
const total = computed(() => Number(props.pagination?.total) || 0)
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <span
      v-if="relationshipLabel"
      class="rounded border border-slate-300 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-950"
    >
      {{ relationshipLabel }}
    </span>
    <span v-if="status" class="rounded px-2 py-1 text-xs font-medium" :class="statusClasses">
      {{ status }}
    </span>
    <ElPagination
      v-if="pagination && total > perPage"
      :current-page="currentPage"
      :page-size="perPage"
      :total="total"
      layout="prev, pager, next"
      @current-change="emit('pageChange', $event)"
    />
  </div>
</template>
