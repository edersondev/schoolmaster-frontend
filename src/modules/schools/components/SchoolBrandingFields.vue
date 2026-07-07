<script setup>
import { computed, markRaw, shallowRef } from 'vue'
import { Upload } from '@element-plus/icons-vue'

const model = defineModel({ type: Object, required: true })
defineProps({
  errors: { type: Object, default: () => ({}) },
})

const uploadFiles = shallowRef([])
const logoName = computed(() => model.value.logo_file?.name ?? model.value.logo_path ?? 'No logo selected')

function setLogoFile(file) {
  model.value.logo_file = file ? markRaw(file) : null
}

function onLogoChange(uploadFile, fileList) {
  uploadFiles.value = fileList.slice(-1)
  setLogoFile(uploadFile.raw ?? null)
}

function onLogoRemove() {
  uploadFiles.value = []
  setLogoFile(null)
}

function onLogoExceed(files) {
  const [file] = files
  uploadFiles.value = file ? [{ name: file.name, raw: file }] : []
  setLogoFile(file ?? null)
}
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <ElFormItem label="Logo" class="sm:col-span-2" :error="errors.logo_file?.[0]">
      <div class="flex w-full flex-col gap-2">
        <ElUpload
          :auto-upload="false"
          :limit="1"
          :file-list="uploadFiles"
          accept="image/png,image/jpeg,image/webp"
          :show-file-list="false"
          :on-change="onLogoChange"
          :on-remove="onLogoRemove"
          :on-exceed="onLogoExceed"
        >
          <ElButton :icon="Upload">Select logo</ElButton>
        </ElUpload>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span class="min-w-0 truncate text-sm text-sm-muted">
            {{ logoName }}
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
