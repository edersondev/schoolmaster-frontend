<script setup>
import { useI18n } from 'vue-i18n'

const model = defineModel({ type: Object, required: true })
defineProps({ errors: { type: Object, default: () => ({}) } })
const { t } = useI18n()
</script>
<template>
  <ElFormItem :label="t('administration.common.name')" required :error="errors.name?.[0]"
    ><ElInput v-model="model.name"
  /></ElFormItem>
  <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
    <ElFormItem
      :label="t('administration.common.startDate')"
      required
      :error="errors.start_date?.[0]"
    >
      <ElDatePicker
        v-model="model.startDate"
        type="date"
        value-format="YYYY-MM-DD"
        class="w-full"
      />
    </ElFormItem>
    <ElFormItem :label="t('administration.common.endDate')" required :error="errors.end_date?.[0]">
      <ElDatePicker v-model="model.endDate" type="date" value-format="YYYY-MM-DD" class="w-full" />
    </ElFormItem>
  </div>
</template>
