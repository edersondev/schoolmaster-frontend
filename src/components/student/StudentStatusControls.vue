<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, default: '' },
  content: { type: Object, default: null },
  pagination: { type: Object, default: null },
})

const emit = defineEmits(['pageChange'])

const statusType = computed(() => {
  if (['active', 'published', 'present', 'clean'].includes(props.status)) return 'success'
  if (['pending', 'pending_scan', 'late'].includes(props.status)) return 'warning'
  if (['failed', 'failed_scan', 'absent', 'inactive', 'unavailable'].includes(props.status)) return 'danger'
  return 'info'
})

const currentPage = computed(() => Number(props.pagination?.page) || 1)
const perPage = computed(() => Number(props.pagination?.perPage) || 25)
const total = computed(() => Number(props.pagination?.total) || 0)
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <ElTag v-if="status" :type="statusType" effect="light">
      {{ status }}
    </ElTag>
    <ElTag v-if="content" :type="content.downloadAvailable ? 'success' : 'warning'" effect="light">
      {{ content.downloadAvailable ? 'Download available' : 'Unavailable' }}
    </ElTag>
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
