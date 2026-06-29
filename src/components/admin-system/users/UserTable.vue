<script setup>
import { useI18n } from 'vue-i18n'
import AdminRowActions from '@/components/ui/admin/AdminRowActions.vue'
import AdminStatusTag from '@/components/ui/admin/AdminStatusTag.vue'

defineProps({
  rows: { type: Array, default: () => [] },
  canManage: { type: Boolean, default: false },
  actionResolver: { type: Function, default: () => [] },
  selectedIds: { type: Array, default: () => [] },
  bulkEnabled: { type: Boolean, default: false },
})
const emit = defineEmits(['sort', 'view', 'edit', 'lifecycle', 'toggle-selection'])
const { t } = useI18n()
</script>

<template>
  <ElTable
    :data="rows"
    class="w-full"
    table-layout="auto"
    @sort-change="emit('sort', $event)"
  >
    <ElTableColumn v-if="bulkEnabled" :min-width="48">
      <template #default="{ row }">
        <ElCheckbox
          :model-value="selectedIds.includes(row.id)"
          :aria-label="`Select ${row.fullName ?? row.id}`"
          @update:model-value="emit('toggle-selection', { row, checked: $event })"
        />
      </template>
    </ElTableColumn>
    <ElTableColumn
      prop="fullName"
      :label="t('administration.common.fullName')"
      sortable="custom"
      :min-width="220"
    >
      <template #default="{ row }">
        <button class="font-medium text-sm-brand hover:underline" type="button" @click="emit('view', row)">
          {{ row.fullName ?? '—' }}
        </button>
      </template>
    </ElTableColumn>
    <ElTableColumn
      prop="email"
      :label="t('administration.common.email')"
      sortable="custom"
      :min-width="220"
    >
      <template #default="{ row }">
        <span class="text-sm-muted">{{ row.email ?? '—' }}</span>
      </template>
    </ElTableColumn>
    <ElTableColumn
      prop="status"
      :label="t('administration.common.status')"
      sortable="custom"
    >
      <template #default="{ row }">
        <AdminStatusTag :status="row.status" compact />
      </template>
    </ElTableColumn>
    <ElTableColumn :label="t('administration.common.roles')" :min-width="200">
      <template #default="{ row }">
        <span class="text-sm-muted">
          {{ row.roles.map((role) => role.name).join(', ') || '—' }}
        </span>
      </template>
    </ElTableColumn>
    <ElTableColumn
      v-if="canManage"
      :label="t('administration.common.actions')"
      :min-width="180"
    >
      <template #default="{ row }">
        <div class="flex items-center gap-2">
          <ElButton
            link
            type="primary"
            data-test="edit-user"
            @click="emit('edit', row)"
          >
            {{ t('administration.common.edit') }}
          </ElButton>
          <AdminRowActions :actions="actionResolver(row)" @action="emit('lifecycle', { row, action: $event })" />
        </div>
      </template>
    </ElTableColumn>
  </ElTable>
</template>
