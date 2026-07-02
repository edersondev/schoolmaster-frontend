<script setup>
import { computed } from 'vue'
import { Download } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { useStudentContentDownload } from '@/composables/student/useStudentContentDownload'
import StudentFeedbackState from './StudentFeedbackState.vue'

const props = defineProps({
  contentItem: { type: Object, required: true },
})

const emit = defineEmits(['downloaded'])
const { t } = useI18n()
const { state, download } = useStudentContentDownload()

const disabled = computed(() => props.contentItem.downloadAvailable !== true || state.pendingId === props.contentItem.id)

function filenameFromDisposition(disposition) {
  const match = disposition?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i)
  return match ? decodeURIComponent(match[1]) : null
}

function startBrowserDownload(result, contentItem) {
  if (!result?.data) return
  const url = URL.createObjectURL(result.data)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download =
    filenameFromDisposition(result.disposition) ||
    contentItem.fileName ||
    contentItem.title ||
    contentItem.id ||
    'download'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

async function handleDownload() {
  const result = await download(props.contentItem)
  if (result) {
    startBrowserDownload(result, props.contentItem)
    emit('downloaded', result)
  }
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <ElButton
      type="primary"
      :icon="Download"
      :disabled="disabled"
      :loading="state.pendingId === contentItem.id"
      @click="handleDownload"
    >
      {{ t('studentSelfService.actions.download') }}
    </ElButton>
    <StudentFeedbackState v-if="state.feedback && state.pendingId === contentItem.id" :feedback="state.feedback" />
  </div>
</template>
