<script setup>
import { useI18n } from 'vue-i18n'
import AdminDataTable from '@/components/ui/admin/AdminDataTable.vue'

defineProps({ rows: { type: Array, default: () => [] } })
const { t } = useI18n()
const columns = [
  { prop: 'name', label: t('administration.common.name'), primary: true, minWidth: 220 },
  { prop: 'code', label: t('administration.common.code') },
  { prop: 'status', label: t('administration.common.status') },
  { prop: 'contactEmail', label: t('administration.common.email'), minWidth: 220 },
]
</script>

<template><AdminDataTable :rows="rows" :columns="columns" /></template>
