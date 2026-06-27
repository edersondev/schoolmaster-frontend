<script setup>
import AdminDataTable from '@/components/ui/admin/AdminDataTable.vue'
import { useI18n } from 'vue-i18n'
defineProps({ rows: { type: Array, default: () => [] } })
defineEmits(['sort'])
const { t } = useI18n()
const columns = [
  {
    prop: 'fullName',
    label: t('administration.common.fullName'),
    primary: true,
    sortable: true,
    minWidth: 220,
  },
  { prop: 'email', label: t('administration.common.email'), sortable: true, minWidth: 220 },
  { prop: 'status', label: t('administration.common.status'), sortable: true },
  { prop: 'roles', label: t('administration.common.roles'), minWidth: 200 },
]
</script>
<template>
  <AdminDataTable :rows="rows" :columns="columns" @sort="$emit('sort', $event)">
    <template #roles="{ row }">{{ row.roles.map((role) => role.name).join(', ') || '—' }}</template>
  </AdminDataTable>
</template>
