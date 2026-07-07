<script setup>
import { useTemplateRef } from 'vue'
import { Upload } from '@element-plus/icons-vue'

const model = defineModel({ type: Object, required: true })
defineProps({
  errors: { type: Object, default: () => ({}) },
})

const fileInput = useTemplateRef('fileInput')

function chooseLogo() {
  fileInput.value?.click()
}

function onLogoChange(event) {
  model.value.logo_file = event.target.files?.[0] ?? null
}
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <ElFormItem label="Logo" class="sm:col-span-2" :error="errors.logo_file?.[0]">
      <div class="flex w-full flex-col gap-2">
        <input
          ref="fileInput"
          class="sr-only"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          @change="onLogoChange"
        />
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <ElButton :icon="Upload" @click="chooseLogo">Select logo</ElButton>
          <span class="min-w-0 truncate text-sm text-sm-muted">
            {{ model.logo_file?.name ?? model.logo_path ?? 'No logo selected' }}
          </span>
        </div>
      </div>
    </ElFormItem>

    <ElFormItem label="Primary color" :error="errors.primary_color?.[0]">
      <div class="flex items-center gap-3">
        <ElColorPicker v-model="model.primary_color" :show-alpha="false" />
        <ElInput v-model="model.primary_color" maxlength="7" />
      </div>
    </ElFormItem>

    <ElFormItem label="Secondary color" :error="errors.secondary_color?.[0]">
      <div class="flex items-center gap-3">
        <ElColorPicker v-model="model.secondary_color" :show-alpha="false" />
        <ElInput v-model="model.secondary_color" maxlength="7" />
      </div>
    </ElFormItem>
  </div>
</template>
