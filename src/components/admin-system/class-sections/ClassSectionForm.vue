<script setup>
const model = defineModel({ type: Object, default: () => ({}) })
defineProps({
  fieldErrors: { type: Object, default: () => ({}) },
  includePeriod: { type: Boolean, default: true },
  periodOptions: { type: Array, default: () => [] },
  periodsLoading: { type: Boolean, default: false },
  metadataOptions: {
    type: Object,
    default: () => ({ course: [], classroom: [], section: [], group: [] }),
  },
})
const emit = defineEmits(['academic-period-change'])
</script>

<template>
  <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
    <ElFormItem
      v-if="includePeriod"
      label="Academic period"
      required
      :error="fieldErrors.academic_period_id?.[0]"
    >
      <ElSelect
        v-model="model.academicPeriodId"
        class="w-full"
        :loading="periodsLoading"
        placeholder="Select academic period"
        @update:model-value="emit('academic-period-change', $event)"
      >
        <ElOption
          v-for="period in periodOptions"
          :key="period.academicPeriodId"
          :label="period.label"
          :value="period.academicPeriodId"
        />
      </ElSelect>
    </ElFormItem>
    <ElFormItem label="Code" required :error="fieldErrors.code?.[0]">
      <ElInput v-model="model.code" />
    </ElFormItem>
    <ElFormItem label="Name" required :error="fieldErrors.name?.[0]">
      <ElInput v-model="model.name" />
    </ElFormItem>
    <ElFormItem label="Course">
      <ElSelect
        v-model="model.course"
        class="w-full"
        filterable
        allow-create
        default-first-option
        clearable
      >
        <ElOption
          v-for="option in metadataOptions.course"
          :key="option"
          :label="option"
          :value="option"
        />
      </ElSelect>
    </ElFormItem>
    <ElFormItem label="Classroom">
      <ElSelect
        v-model="model.classroom"
        class="w-full"
        filterable
        allow-create
        default-first-option
        clearable
      >
        <ElOption
          v-for="option in metadataOptions.classroom"
          :key="option"
          :label="option"
          :value="option"
        />
      </ElSelect>
    </ElFormItem>
    <ElFormItem label="Section">
      <ElSelect
        v-model="model.section"
        class="w-full"
        filterable
        allow-create
        default-first-option
        clearable
      >
        <ElOption
          v-for="option in metadataOptions.section"
          :key="option"
          :label="option"
          :value="option"
        />
      </ElSelect>
    </ElFormItem>
    <ElFormItem label="Group">
      <ElSelect
        v-model="model.group"
        class="w-full"
        filterable
        allow-create
        default-first-option
        clearable
      >
        <ElOption
          v-for="option in metadataOptions.group"
          :key="option"
          :label="option"
          :value="option"
        />
      </ElSelect>
    </ElFormItem>
  </div>
</template>
