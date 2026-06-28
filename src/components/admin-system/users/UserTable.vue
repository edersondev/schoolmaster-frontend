<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  rows: { type: Array, default: () => [] },
  canManage: { type: Boolean, default: false },
})
const emit = defineEmits(['sort', 'edit', 'delete'])
const { t } = useI18n()
</script>

<template>
  <ElTable
    :data="rows"
    class="w-full"
    table-layout="auto"
    @sort-change="emit('sort', $event)"
  >
    <ElTableColumn
      prop="fullName"
      :label="t('administration.common.fullName')"
      sortable="custom"
      :min-width="220"
    >
      <template #default="{ row }">
        <span class="font-medium text-sm-text">{{ row.fullName ?? '—' }}</span>
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
        <span class="text-sm-muted">{{ row.status ?? '—' }}</span>
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
          <ElButton
            link
            type="danger"
            data-test="delete-user"
            @click="emit('delete', row)"
          >
            {{ t('administration.common.delete') }}
          </ElButton>
        </div>
      </template>
    </ElTableColumn>
  </ElTable>
</template>
