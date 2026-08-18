<script setup>
import AdminDataTable from '@/components/ui/admin/AdminDataTable.vue'
import AdminRowActions from '@/components/ui/admin/AdminRowActions.vue'
import AdminStatusTag from '@/components/ui/admin/AdminStatusTag.vue'
import { useI18n } from 'vue-i18n'
const props = defineProps({
  rows: { type: Array, default: () => [] },
  canManage: { type: Boolean, default: false },
  actionResolver: { type: Function, default: () => [] },
  selectedIds: { type: Array, default: () => [] },
  bulkEnabled: { type: Boolean, default: false },
})
const emit = defineEmits(['view', 'edit', 'permissions', 'lifecycle', 'toggle-selection'])
const { t } = useI18n()
const columns = [
  { prop: 'select', label: '', minWidth: 48 },
  { prop: 'name', label: t('administration.common.name'), primary: true },
  { prop: 'scope', label: t('administration.common.scope') },
  { prop: 'status', label: t('administration.common.status') },
  { prop: 'actions', label: t('administration.common.actions'), minWidth: 180 },
]

function actionsFor(row) {
  const actions = [
    {
      key: 'listPermissions',
      command: 'listPermissions',
      label: t('administration.roles.listPermissions'),
      dataTest: `list-role-permissions-${row.id}`,
    },
  ]

  if (props.canManage) actions.push(...props.actionResolver(row))

  return actions
}

function onAction(row, action) {
  if (action === 'listPermissions') {
    emit('permissions', row)
    return
  }

  emit('lifecycle', { row, action })
}
</script>
<template>
  <AdminDataTable :rows="rows" :columns="columns">
    <template #name="{ row }">
      <button
        class="font-medium text-sm-brand hover:underline"
        type="button"
        @click="$emit('view', row)"
      >
        {{ row.name ?? '—' }}
      </button>
    </template>
    <template #select="{ row }">
      <ElCheckbox
        v-if="bulkEnabled"
        :model-value="selectedIds.includes(row.id)"
        :aria-label="`Select ${row.name ?? row.id}`"
        @update:model-value="$emit('toggle-selection', { row, checked: $event })"
      />
    </template>
    <template #status="{ row }"><AdminStatusTag :status="row.status" compact /></template>
    <template #actions="{ row }">
      <div class="flex items-center gap-2">
        <ElButton v-if="canManage" link type="primary" @click="$emit('edit', row)">{{
          t('administration.common.edit')
        }}</ElButton>
        <AdminRowActions :actions="actionsFor(row)" @action="onAction(row, $event)" />
      </div>
    </template>
  </AdminDataTable>
</template>
