<script setup>
const props = defineProps({
  modelValue: { type: Object, default: () => ({ allowedCategories: ['pdf', 'image', 'text', 'office'], maxFiles: 1, maxFileSize: 26214400 }) },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

function update(field, value) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-2">
    <ElFormItem label="Allowed categories">
      <ElSelect :model-value="modelValue.allowedCategories" multiple :disabled="disabled" @update:model-value="update('allowedCategories', $event)">
        <ElOption label="PDF" value="pdf" />
        <ElOption label="Image" value="image" />
        <ElOption label="Text" value="text" />
        <ElOption label="Office" value="office" />
      </ElSelect>
    </ElFormItem>
    <ElFormItem label="Maximum size">
      <ElInputNumber :model-value="modelValue.maxFileSize" :min="1" :max="26214400" :disabled="disabled" @update:model-value="update('maxFileSize', $event)" />
    </ElFormItem>
  </div>
</template>
