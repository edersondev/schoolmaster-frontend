<script setup>
import { useI18n } from 'vue-i18n'
import PhoneField from '@/components/ui/PhoneField.vue'

const model = defineModel({ type: Object, default: () => ({}) })
defineProps({
  fieldErrors: { type: Object, default: () => ({}) },
})
const { t } = useI18n()
</script>

<template>
  <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
    <ElFormItem
      :label="t('studentEnrollmentRoster.students.registrationNumber')"
      required
      :error="fieldErrors.registration_number?.[0]"
    >
      <ElInput v-model="model.registrationNumber" autocomplete="off" />
    </ElFormItem>
    <ElFormItem
      :label="t('studentEnrollmentRoster.students.enrollmentDate')"
      required
      :error="fieldErrors.enrolled_at?.[0]"
    >
      <ElDatePicker
        v-model="model.enrolledAt"
        class="!w-full"
        type="date"
        value-format="YYYY-MM-DD"
      />
    </ElFormItem>
    <ElFormItem
      :label="t('studentEnrollmentRoster.students.firstName')"
      required
      :error="fieldErrors.first_name?.[0]"
    >
      <ElInput v-model="model.firstName" autocomplete="given-name" />
    </ElFormItem>
    <ElFormItem
      :label="t('studentEnrollmentRoster.students.lastName')"
      required
      :error="fieldErrors.last_name?.[0]"
    >
      <ElInput v-model="model.lastName" autocomplete="family-name" />
    </ElFormItem>
    <ElFormItem :label="t('studentEnrollmentRoster.students.dateOfBirth')">
      <ElDatePicker
        v-model="model.dateOfBirth"
        class="!w-full"
        type="date"
        value-format="YYYY-MM-DD"
      />
    </ElFormItem>
    <ElFormItem :label="t('administration.common.status')">
      <ElSelect v-model="model.status" class="w-full">
        <ElOption :label="t('administration.common.active')" value="active" />
        <ElOption :label="t('administration.common.inactive')" value="inactive" />
      </ElSelect>
    </ElFormItem>
    <ElFormItem :label="t('studentEnrollmentRoster.students.contactEmail')">
      <ElInput v-model="model.contactEmail" type="email" autocomplete="email" />
    </ElFormItem>
    <ElFormItem :label="t('studentEnrollmentRoster.students.contactPhone')">
      <PhoneField v-model="model.contactPhone" />
    </ElFormItem>
  </div>
</template>
