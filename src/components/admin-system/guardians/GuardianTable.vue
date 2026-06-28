<script setup>
import AdminDataTable from '@/components/ui/admin/AdminDataTable.vue'
import { useI18n } from 'vue-i18n'
defineProps({ rows: { type: Array, default: () => [] } })
const { t } = useI18n()
const columns = [
  { prop: 'fullName', label: t('administration.common.fullName'), primary: true, minWidth: 220 },
  { prop: 'relationshipType', label: t('administration.common.relationship') },
  { prop: 'contactEmail', label: t('administration.common.email'), minWidth: 220 },
  { prop: 'contactPhone', label: t('administration.common.phone') },
  { prop: 'status', label: t('administration.common.status') },
]
</script>
<template><AdminDataTable :rows="rows" :columns="columns" /></template>
