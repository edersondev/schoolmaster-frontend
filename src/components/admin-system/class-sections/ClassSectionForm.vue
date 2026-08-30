<script setup>
const model = defineModel({ type: Object, default: () => ({}) })
defineProps({
  fieldErrors: { type: Object, default: () => ({}) },
  includePeriod: { type: Boolean, default: true },
})
</script>

<template>
  <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
    <ElFormItem
      v-if="includePeriod"
      label="Academic period"
      required
      :error="fieldErrors.academic_period_id?.[0]"
    >
      <ElInput v-model="model.academicPeriodId" />
    </ElFormItem>
    <ElFormItem label="Code" required :error="fieldErrors.code?.[0]">
      <ElInput v-model="model.code" />
    </ElFormItem>
    <ElFormItem label="Name" required :error="fieldErrors.name?.[0]">
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
  </div>
</template>
