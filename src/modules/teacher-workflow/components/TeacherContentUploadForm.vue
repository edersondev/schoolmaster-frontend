<script setup>
import { TEACHER_CONTENT_TYPES, MAX_TEACHER_CONTENT_FILE_BYTES } from '../services/teacherContentService'

const draft = defineModel({ type: Object, required: true })
const props = defineProps({
  pending: { type: Boolean, default: false },
})
const emit = defineEmits(['submit'])

function onFileChange(event) {
  draft.value.file = event.target.files?.[0] ?? null
}
</script>

<template>
  <form class="grid gap-4 rounded-2xl border border-sm-border bg-sm-surface p-5" @submit.prevent="emit('submit')">
    <ElFormItem label="Title" required>
      <ElInput v-model="draft.title" />
    </ElFormItem>
    <ElFormItem label="Description">
      <ElInput v-model="draft.description" type="textarea" />
    </ElFormItem>
    <ElFormItem label="Content type" required>
      <ElSelect v-model="draft.contentType" class="w-full">
        <ElOption v-for="type in TEACHER_CONTENT_TYPES" :key="type" :label="type" :value="type" />
      </ElSelect>
    </ElFormItem>
    <ElFormItem label="File" required>
      <input type="file" :disabled="pending" @change="onFileChange" />
      <p class="mt-2 text-sm text-sm-muted">Maximum {{ Math.round(MAX_TEACHER_CONTENT_FILE_BYTES / 1024 / 1024) }} MB.</p>
    </ElFormItem>
    <div>
      <ElButton type="primary" native-type="submit" :loading="pending">Upload</ElButton>
    </div>
  </form>
</template>
