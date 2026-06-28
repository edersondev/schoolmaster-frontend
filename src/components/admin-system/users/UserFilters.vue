<script setup>
import AdminFilterBar from '@/components/ui/admin/AdminFilterBar.vue'
import { useI18n } from 'vue-i18n'
defineProps({ status: { type: String, default: '' }, sort: { type: String, default: '' } })
defineEmits(['update:status', 'update:sort', 'reset'])
const { t } = useI18n()
const sorts = [
  { label: t('administration.common.nameAscending'), value: 'full_name' },
  { label: t('administration.common.nameDescending'), value: '-full_name' },
  { label: t('administration.common.emailAscending'), value: 'email' },
]
</script>
<template>
  <AdminFilterBar
    :status="status"
    :sort="sort"
    :sort-options="sorts"
    show-status
    @update:status="$emit('update:status', $event)"
    @update:sort="$emit('update:sort', $event)"
    @reset="$emit('reset')"
  />
</template>
