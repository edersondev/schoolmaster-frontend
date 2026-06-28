<script setup>
import AdminFilterBar from '@/components/ui/admin/AdminFilterBar.vue'
import AdminLookupSelect from '@/components/ui/admin/AdminLookupSelect.vue'
import { useI18n } from 'vue-i18n'
defineProps({
  status: { type: String, default: '' },
  academicYearId: { type: String, default: '' },
  years: { type: Array, default: () => [] },
  yearsLoading: { type: Boolean, default: false },
  lookupMeta: {
    type: Object,
    default: () => ({ page: 1, perPage: 25, total: 0 }),
  },
})
defineEmits(['update:status', 'update:academicYearId', 'lookup-page', 'reset'])
const { t } = useI18n()
</script>
<template>
  <AdminFilterBar
    :status="status"
    show-status
    @update:status="$emit('update:status', $event)"
    @reset="$emit('reset')"
  >
    <ElFormItem :label="t('administration.common.academicYear')" class="!mb-0 min-w-56">
      <AdminLookupSelect
        :model-value="academicYearId"
        :options="years"
        :loading="yearsLoading"
        :page="lookupMeta.page"
        :per-page="lookupMeta.perPage"
        :total="lookupMeta.total"
        :placeholder="t('administration.common.filterAcademicYear')"
        @update:model-value="$emit('update:academicYearId', $event)"
        @page="$emit('lookup-page', $event)"
      />
    </ElFormItem>
  </AdminFilterBar>
</template>
