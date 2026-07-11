<script setup>
import { useI18n } from 'vue-i18n'
import AdminRowActions from '@/components/ui/admin/AdminRowActions.vue'
import AdminStatusTag from '@/components/ui/admin/AdminStatusTag.vue'
import { formatCnpj } from '@/utils/cnpj'

const props = defineProps({
  rows: { type: Array, default: () => [] },
  canManage: { type: Boolean, default: false },
  actionResolver: { type: Function, default: () => [] },
})
const emit = defineEmits(['view', 'edit', 'lifecycle'])
const { t } = useI18n()

const editAction = Object.freeze({
  key: 'edit',
  command: 'edit',
  labelKey: 'administration.common.edit',
  dataTest: 'edit-school',
})

function rowActions(row) {
  return [editAction, ...props.actionResolver(row)]
}

function handleRowAction(row, action) {
  if (action === 'edit') {
    emit('edit', row)
    return
  }

  emit('lifecycle', { row, action })
}
</script>

<template>
  <ElTable :data="rows" class="w-full" table-layout="auto">
    <ElTableColumn prop="name" :label="t('administration.common.name')" :min-width="220">
      <template #default="{ row }">
        <button
          class="font-medium text-sm-brand hover:underline"
          type="button"
          @click="emit('view', row)"
        >
          {{ row.name ?? '—' }}
        </button>
      </template>
    </ElTableColumn>
    <ElTableColumn prop="cnpj" :label="t('administration.common.cnpj')" :min-width="170">
      <template #default="{ row }">
        <span class="text-sm-muted">{{ formatCnpj(row.cnpj) || '—' }}</span>
      </template>
    </ElTableColumn>
    <ElTableColumn prop="status" :label="t('administration.common.status')">
      <template #default="{ row }">
        <AdminStatusTag :status="row.status" compact />
      </template>
    </ElTableColumn>
    <ElTableColumn prop="contactEmail" :label="t('administration.common.email')" :min-width="220">
      <template #default="{ row }">
        <span class="text-sm-muted">{{ row.contactEmail ?? '—' }}</span>
      </template>
    </ElTableColumn>
    <ElTableColumn v-if="canManage" :label="t('administration.common.actions')" :min-width="180">
      <template #default="{ row }">
        <AdminRowActions :actions="rowActions(row)" @action="handleRowAction(row, $event)" />
      </template>
    </ElTableColumn>
  </ElTable>
</template>
