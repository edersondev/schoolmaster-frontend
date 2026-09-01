<script setup>
import { useI18n } from 'vue-i18n'
import AdminDataTable from '@/components/ui/admin/AdminDataTable.vue'
import AdminStatusTag from '@/components/ui/admin/AdminStatusTag.vue'

defineProps({
  rows: { type: Array, default: () => [] },
})
defineEmits(['view'])
const { t } = useI18n()
const columns = [
  {
    prop: 'fullName',
    label: t('studentEnrollmentRoster.students.student'),
    primary: true,
    minWidth: 220,
  },
  {
    prop: 'registrationNumber',
    label: t('studentEnrollmentRoster.students.registrationNumber'),
    minWidth: 160,
  },
  {
    prop: 'enrolledAt',
    label: t('studentEnrollmentRoster.students.enrolledAt'),
    minWidth: 140,
  },
  { prop: 'status', label: t('administration.common.status'), minWidth: 140 },
  { prop: 'actions', label: t('administration.common.actions'), minWidth: 120 },
]
</script>

<template>
  <AdminDataTable :rows="rows" :columns="columns">
    <template #fullName="{ row }">
      <button
        class="font-medium text-sm-brand hover:underline"
        type="button"
        @click="$emit('view', row)"
      >
        {{ row.fullName ?? '—' }}
      </button>
    </template>
    <template #status="{ row }">
      <AdminStatusTag :status="row.status" compact />
    </template>
    <template #actions="{ row }">
      <ElButton link type="primary" @click="$emit('view', row)">
        {{ t('administration.common.view') }}
      </ElButton>
    </template>
  </AdminDataTable>
</template>
