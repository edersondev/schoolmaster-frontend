<script setup>
import AdminDataTable from '@/components/ui/admin/AdminDataTable.vue'
import { useI18n } from 'vue-i18n'
defineProps({ rows: { type: Array, default: () => [] } })
const { t } = useI18n()
const columns = [
  { prop: 'name', label: t('administration.common.name'), primary: true },
  { prop: 'scope', label: t('administration.common.scope') },
  { prop: 'status', label: t('administration.common.status') },
  { prop: 'permissions', label: t('administration.common.permissions'), minWidth: 260 },
]
</script>
<template>
  <AdminDataTable :rows="rows" :columns="columns">
    <template #permissions="{ row }">{{
      row.permissions.map((permission) => permission.name).join(', ') || '—'
    }}</template>
  </AdminDataTable>
</template>
