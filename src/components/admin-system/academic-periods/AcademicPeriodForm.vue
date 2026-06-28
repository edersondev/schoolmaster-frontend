<script setup>
import AdminLookupSelect from '@/components/ui/admin/AdminLookupSelect.vue'
import { useI18n } from 'vue-i18n'

const model = defineModel({ type: Object, required: true })
defineProps({
  errors: { type: Object, default: () => ({}) },
  years: { type: Array, default: () => [] },
  yearsLoading: { type: Boolean, default: false },
  lookupMeta: {
    type: Object,
    default: () => ({ page: 1, perPage: 25, total: 0 }),
  },
})
defineEmits(['lookup-page'])
const { t } = useI18n()
</script>
<template>
  <ElFormItem
    :label="t('administration.common.academicYear')"
    required
    :error="errors.academic_year_id?.[0]"
  >
    <AdminLookupSelect
      v-model="model.academicYearId"
      :options="years"
      :loading="yearsLoading"
      :page="lookupMeta.page"
      :per-page="lookupMeta.perPage"
      :total="lookupMeta.total"
      @page="$emit('lookup-page', $event)"
    />
  </ElFormItem>
  <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
    <ElFormItem :label="t('administration.common.name')" required :error="errors.name?.[0]"
      ><ElInput v-model="model.name"
    /></ElFormItem>
    <ElFormItem :label="t('administration.common.sequence')" required :error="errors.sequence?.[0]"
      ><ElInputNumber v-model="model.sequence" :min="1" class="w-full"
    /></ElFormItem>
    <ElFormItem
      :label="t('administration.common.startDate')"
      required
      :error="errors.start_date?.[0]"
      ><ElDatePicker v-model="model.startDate" type="date" value-format="YYYY-MM-DD" class="w-full"
    /></ElFormItem>
    <ElFormItem :label="t('administration.common.endDate')" required :error="errors.end_date?.[0]"
      ><ElDatePicker v-model="model.endDate" type="date" value-format="YYYY-MM-DD" class="w-full"
    /></ElFormItem>
  </div>
</template>
