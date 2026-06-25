<script setup>
import AdminDataTable from '@/components/ui/admin/AdminDataTable.vue'
import { useI18n } from 'vue-i18n'
defineProps({ rows: { type: Array, default: () => [] } })
const { t } = useI18n()
const columns = [
  { prop: 'name', label: t('administration.common.name'), primary: true },
  { prop: 'sequence', label: t('administration.common.sequence') },
  { prop: 'startDate', label: t('administration.common.startDate') },
  { prop: 'endDate', label: t('administration.common.endDate') },
  { prop: 'status', label: t('administration.common.status') },
]
</script>
<template><AdminDataTable :rows="rows" :columns="columns" /></template>
