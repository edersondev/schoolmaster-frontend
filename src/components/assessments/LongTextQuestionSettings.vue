<script setup>
const props = defineProps({
  modelValue: { type: Object, default: () => ({ minLength: 1, maxLength: 10000, plainTextOnly: true }) },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

function update(field, value) {
  emit('update:modelValue', { ...props.modelValue, [field]: Number(value) || value })
}
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-2">
    <ElFormItem label="Minimum length">
      <ElInputNumber :model-value="modelValue.minLength" :min="1" :max="10000" :disabled="disabled" @update:model-value="update('minLength', $event)" />
    </ElFormItem>
    <ElFormItem label="Maximum length">
      <ElInputNumber :model-value="modelValue.maxLength" :min="1" :max="10000" :disabled="disabled" @update:model-value="update('maxLength', $event)" />
    </ElFormItem>
  </div>
</template>
