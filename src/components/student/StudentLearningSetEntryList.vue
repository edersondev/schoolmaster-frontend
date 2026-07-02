<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import StudentContentDownloadAction from './StudentContentDownloadAction.vue'
import StudentStatusControls from './StudentStatusControls.vue'

const props = defineProps({
  entries: { type: Array, default: () => [] },
})

const emit = defineEmits(['downloaded'])
const { t } = useI18n()

const orderedEntries = computed(() => [...props.entries].sort((a, b) => a.sequence - b.sequence))
</script>

<template>
  <div class="space-y-3">
    <article
      v-for="entry in orderedEntries"
      :key="entry.entryReferenceId"
      class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div class="min-w-0">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {{ t('studentSelfService.labels.sequence') }} {{ entry.sequence }}
          </p>
          <h3 class="break-words text-base font-semibold text-slate-950">{{ entry.title }}</h3>
          <p class="text-sm text-slate-600">{{ entry.entryType }}</p>
        </div>
        <StudentStatusControls v-if="entry.contentItem" :content="entry.contentItem" />
      </div>

      <div v-if="entry.contentItem" class="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
        <span>{{ t('studentSelfService.labels.contentType') }}: {{ entry.contentItem.contentType }}</span>
        <span>{{ t('studentSelfService.labels.fileSize') }}: {{ entry.contentItem.fileSizeBytes }}</span>
        <span>{{ t('studentSelfService.labels.scanStatus') }}: {{ entry.contentItem.scanStatus }}</span>
      </div>
      <StudentContentDownloadAction
        v-if="entry.contentItem"
        class="mt-4"
        :content-item="entry.contentItem"
        @downloaded="emit('downloaded', $event)"
      />
      <ElAlert
        v-else
        class="mt-4"
        type="info"
        :closable="false"
        :title="t('studentSelfService.learningSets.questionnaireReadOnly')"
      />
    </article>
  </div>
</template>
