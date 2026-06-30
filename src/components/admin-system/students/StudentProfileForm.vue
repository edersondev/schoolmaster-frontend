<script setup>
const model = defineModel({ type: Object, default: () => ({}) })
defineProps({
  pending: { type: Boolean, default: false },
  fieldErrors: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['submit'])
</script>

<template>
  <ElForm label-position="top" class="grid gap-4 md:grid-cols-2" @submit.prevent="emit('submit')">
    <ElFormItem label="Registration number" :error="fieldErrors.registration_number?.[0]">
      <ElInput v-model="model.registrationNumber" autocomplete="off" />
    </ElFormItem>
    <ElFormItem label="Enrollment date" :error="fieldErrors.enrolled_at?.[0]">
      <ElDatePicker v-model="model.enrolledAt" class="w-full" type="date" value-format="YYYY-MM-DD" />
    </ElFormItem>
    <ElFormItem label="First name" :error="fieldErrors.first_name?.[0]">
      <ElInput v-model="model.firstName" autocomplete="given-name" />
    </ElFormItem>
    <ElFormItem label="Last name" :error="fieldErrors.last_name?.[0]">
      <ElInput v-model="model.lastName" autocomplete="family-name" />
    </ElFormItem>
    <ElFormItem label="Date of birth">
      <ElDatePicker v-model="model.dateOfBirth" class="w-full" type="date" value-format="YYYY-MM-DD" />
    </ElFormItem>
    <ElFormItem label="Status">
      <ElSelect v-model="model.status" class="w-full">
        <ElOption label="Active" value="active" />
        <ElOption label="Inactive" value="inactive" />
      </ElSelect>
    </ElFormItem>
    <ElFormItem label="Contact email">
      <ElInput v-model="model.contactEmail" autocomplete="email" />
    </ElFormItem>
    <ElFormItem label="Contact phone">
      <ElInput v-model="model.contactPhone" autocomplete="tel" />
    </ElFormItem>
    <div class="md:col-span-2 flex justify-end">
      <ElButton type="primary" native-type="submit" :loading="pending">Save</ElButton>
    </div>
  </ElForm>
</template>
