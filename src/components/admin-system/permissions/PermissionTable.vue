<script setup>
import AdminDataTable from '@/components/ui/admin/AdminDataTable.vue'
import { useI18n } from 'vue-i18n'
defineProps({ rows: { type: Array, default: () => [] } })
const { t } = useI18n()
const columns = [
  { prop: 'name', label: t('administration.common.name'), primary: true },
  { prop: 'code', label: t('administration.common.code'), minWidth: 220 },
  { prop: 'scope', label: t('administration.common.scope') },
  { prop: 'status', label: t('administration.common.status') },
]
</script>
<template><AdminDataTable :rows="rows" :columns="columns" /></template>
