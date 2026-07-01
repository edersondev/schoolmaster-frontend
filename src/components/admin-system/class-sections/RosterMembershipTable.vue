<script setup>
import AdminLifecycleStatusTag from '@/components/admin-system/shared/AdminLifecycleStatusTag.vue'

defineProps({
  rows: { type: Array, default: () => [] },
  selectedIds: { type: Array, default: () => [] },
})
const emit = defineEmits(['select', 'page'])
</script>

<template>
  <div class="w-full max-w-full overflow-x-auto">
    <div class="min-w-[38rem]">
      <ElTable :data="rows" class="w-full" @selection-change="emit('select', $event.map((row) => row.id))">
        <ElTableColumn type="selection" width="48" />
        <ElTableColumn prop="studentProfileId" label="Student" min-width="180" />
        <ElTableColumn prop="effectiveStartDate" label="Start" min-width="130" />
        <ElTableColumn prop="effectiveEndDate" label="End" min-width="130" />
        <ElTableColumn prop="status" label="Status" min-width="120">
          <template #default="{ row }">
            <AdminLifecycleStatusTag :status="row.status" compact />
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
  </div>
  <ElEmpty v-if="rows.length === 0" description="No memberships" />
</template>
