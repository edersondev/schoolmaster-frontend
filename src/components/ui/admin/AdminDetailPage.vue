<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminFeedbackState from './AdminFeedbackState.vue'
import AdminStatusTag from './AdminStatusTag.vue'
import AdminConflictFeedback from './AdminConflictFeedback.vue'

const props = defineProps({
  title: { type: String, required: true },
  status: { type: String, default: 'idle' },
  feedback: { type: Object, default: null },
  recordStatus: { type: String, default: '' },
  returnTo: { type: [String, Object], default: null },
  canEdit: { type: Boolean, default: false },
  editTo: { type: [String, Object], default: null },
})

defineEmits(['retry'])
const { t } = useI18n()
const ready = computed(() => props.status === 'ready')
</script>

<template>
  <section class="mx-auto flex w-full max-w-screen-xl flex-col gap-4">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex flex-col gap-2">
        <RouterLink v-if="returnTo" class="text-sm font-medium text-sm-brand" :to="returnTo">
          {{ t('administrationLifecycle.detail.backToList') }}
        </RouterLink>
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="font-display text-2xl font-semibold text-sm-text">{{ title }}</h1>
          <AdminStatusTag v-if="recordStatus" :status="recordStatus" />
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <slot name="actions" />
        <RouterLink
          v-if="canEdit && editTo"
          class="inline-flex min-h-8 items-center justify-center rounded border border-sm-brand bg-sm-brand px-4 py-2 text-sm font-medium text-white transition hover:border-sm-brand-strong hover:bg-sm-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sm-brand"
          :to="editTo"
        >
          {{ t('administrationLifecycle.detail.edit') }}
        </RouterLink>
      </div>
    </header>
    <AdminConflictFeedback :feedback="feedback" />
    <AdminFeedbackState
      v-if="!ready"
      :state="status"
      :feedback="feedback"
      @retry="$emit('retry')"
    />
    <div v-else class="rounded-lg border border-sm-border bg-sm-surface p-4 sm:p-6">
      <slot />
    </div>
  </section>
</template>
