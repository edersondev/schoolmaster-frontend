<script setup>
import AdminLifecycleStatusTag from '@/components/admin-system/shared/AdminLifecycleStatusTag.vue'

defineProps({
  rows: { type: Array, default: () => [] },
})
const emit = defineEmits(['view', 'deactivate'])
</script>

<template>
  <div class="w-full max-w-full overflow-x-auto">
    <div class="min-w-[50rem]">
      <ElTable :data="rows" class="w-full">
        <ElTableColumn prop="teacherUserId" label="Teacher" min-width="180" />
        <ElTableColumn prop="classSectionId" label="Class section" min-width="180" />
        <ElTableColumn prop="effectiveStartDate" label="Start" min-width="130" />
        <ElTableColumn prop="status" label="Status" min-width="120">
          <template #default="{ row }">
            <AdminLifecycleStatusTag :status="row.status" compact />
          </template>
        </ElTableColumn>
        <ElTableColumn label="Actions" width="180">
          <template #default="{ row }">
            <ElButton size="small" @click="emit('view', row)">View</ElButton>
            <ElButton size="small" type="warning" @click="emit('deactivate', row)">Deactivate</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
  </div>
  <ElEmpty v-if="rows.length === 0" description="No assignments" />
</template>
