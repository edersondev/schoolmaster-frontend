<script setup>
const model = defineModel({ type: Object, default: () => ({}) })
defineProps({
  pending: { type: Boolean, default: false },
  fieldErrors: { type: Object, default: () => ({}) },
  includePeriod: { type: Boolean, default: true },
})
const emit = defineEmits(['submit'])
</script>

<template>
  <ElForm label-position="top" class="grid gap-4 md:grid-cols-2" @submit.prevent="emit('submit')">
    <ElFormItem v-if="includePeriod" label="Academic period" :error="fieldErrors.academic_period_id?.[0]">
      <ElInput v-model="model.academicPeriodId" />
    </ElFormItem>
    <ElFormItem label="Code" :error="fieldErrors.code?.[0]">
      <ElInput v-model="model.code" />
    </ElFormItem>
    <ElFormItem label="Name" :error="fieldErrors.name?.[0]">
      <ElInput v-model="model.name" />
    </ElFormItem>
    <ElFormItem label="Course">
      <ElInput v-model="model.course" />
    </ElFormItem>
    <ElFormItem label="Classroom">
      <ElInput v-model="model.classroom" />
    </ElFormItem>
    <ElFormItem label="Section">
      <ElInput v-model="model.section" />
    </ElFormItem>
    <ElFormItem label="Group">
      <ElInput v-model="model.group" />
    </ElFormItem>
    <div class="md:col-span-2 flex justify-end">
      <ElButton type="primary" native-type="submit" :loading="pending">Save</ElButton>
    </div>
  </ElForm>
</template>
