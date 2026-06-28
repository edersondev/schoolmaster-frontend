<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  rows: { type: Array, default: () => [] },
  canManage: { type: Boolean, default: false },
})
const emit = defineEmits(['edit', 'delete'])
const { t } = useI18n()
</script>

<template>
  <ElTable :data="rows" class="w-full" table-layout="auto">
    <ElTableColumn
      prop="name"
      :label="t('administration.common.name')"
      :min-width="220"
    >
      <template #default="{ row }">
        <span class="font-medium text-sm-text">{{ row.name ?? '—' }}</span>
      </template>
    </ElTableColumn>
    <ElTableColumn prop="code" :label="t('administration.common.code')">
      <template #default="{ row }">
        <span class="text-sm-muted">{{ row.code ?? '—' }}</span>
      </template>
    </ElTableColumn>
    <ElTableColumn prop="status" :label="t('administration.common.status')">
      <template #default="{ row }">
        <span class="text-sm-muted">{{ row.status ?? '—' }}</span>
      </template>
    </ElTableColumn>
    <ElTableColumn
      prop="contactEmail"
      :label="t('administration.common.email')"
      :min-width="220"
    >
      <template #default="{ row }">
        <span class="text-sm-muted">{{ row.contactEmail ?? '—' }}</span>
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
            data-test="edit-school"
            @click="emit('edit', row)"
          >
            {{ t('administration.common.edit') }}
          </ElButton>
          <ElButton
            link
            type="danger"
            data-test="delete-school"
            @click="emit('delete', row)"
          >
            {{ t('administration.common.delete') }}
          </ElButton>
        </div>
      </template>
    </ElTableColumn>
  </ElTable>
</template>
