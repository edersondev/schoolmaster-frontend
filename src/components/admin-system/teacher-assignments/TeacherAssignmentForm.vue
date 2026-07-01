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
    <ElFormItem label="Class section" :error="fieldErrors.class_section_id?.[0]">
      <ElInput v-model="model.classSectionId" />
    </ElFormItem>
    <ElFormItem label="Teacher user" :error="fieldErrors.teacher_user_id?.[0]">
      <ElInput v-model="model.teacherUserId" />
    </ElFormItem>
    <ElFormItem label="Academic period" :error="fieldErrors.academic_period_id?.[0]">
      <ElInput v-model="model.academicPeriodId" />
    </ElFormItem>
    <ElFormItem label="Effective start" :error="fieldErrors.effective_start_date?.[0]">
      <ElDatePicker v-model="model.effectiveStartDate" class="w-full" type="date" value-format="YYYY-MM-DD" />
    </ElFormItem>
    <div class="md:col-span-2 flex justify-end">
      <ElButton type="primary" native-type="submit" :loading="pending">Assign</ElButton>
    </div>
  </ElForm>
</template>
