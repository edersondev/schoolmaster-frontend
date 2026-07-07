<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminConflictFeedback from './AdminConflictFeedback.vue'

const open = defineModel('open', { type: Boolean, default: false })
const values = defineModel('values', {
  type: Object,
  default: () => ({ effectiveAt: '', reason: '' }),
})

const props = defineProps({
  action: { type: String, default: '' },
  resourceLabel: { type: String, default: '' },
  resourceType: { type: String, default: '' },
  currentStatus: { type: String, default: '' },
  selectedCount: { type: Number, default: 0 },
  pending: { type: Boolean, default: false },
  fieldErrors: { type: Object, default: () => ({}) },
  formError: { type: Object, default: null },
  bulk: { type: Boolean, default: false },
})

const emit = defineEmits(['submit', 'cancel'])
const { t } = useI18n()
const actionLabel = computed(() =>
  props.action ? t(`administrationLifecycle.actions.${props.action}`) : '',
)
const title = computed(() => {
  if (!actionLabel.value) return ''
  return props.bulk
    ? t('administrationLifecycle.confirmation.bulkTitle', {
        action: actionLabel.value,
        resource: props.resourceType,
      })
    : t('administrationLifecycle.confirmation.title', {
        action: actionLabel.value,
        resource: props.resourceLabel,
      })
})
const message = computed(() => {
  if (!actionLabel.value) return ''
  return props.bulk
    ? t('administrationLifecycle.confirmation.bulkMessage', {
        count: props.selectedCount,
        resource: props.resourceType,
      })
    : t('administrationLifecycle.confirmation.message', {
        action: actionLabel.value.toLowerCase(),
        resource: props.resourceLabel,
      })
})
</script>

<template>
  <ElDialog v-model="open" :title="title" width="min(92vw, 560px)" @closed="emit('cancel')">
    <div class="flex flex-col gap-4">
      <p class="text-sm text-sm-muted">{{ message }}</p>
      <p v-if="action === 'delete'" class="text-sm font-medium text-amber-700">
        {{ t('administrationLifecycle.confirmation.deleteHint') }}
      </p>
      <p v-if="currentStatus" class="text-sm text-sm-muted">
        {{ t('administration.common.status') }}: {{ currentStatus }}
      </p>
      <AdminConflictFeedback :feedback="formError" />
      <ElForm label-position="top" @submit.prevent="emit('submit')">
        <ElFormItem
          :label="t('administrationLifecycle.confirmation.effectiveDate')"
          :error="fieldErrors.effective_at?.join(' ')"
        >
          <ElDatePicker
            v-model="values.effectiveAt"
            type="date"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
          <p v-if="fieldErrors.effective_at?.length" class="mt-1 text-xs text-red-700">
            {{ fieldErrors.effective_at.join(' ') }}
          </p>
        </ElFormItem>
        <ElFormItem
          :label="t('administrationLifecycle.confirmation.reason')"
          :error="fieldErrors.reason?.join(' ')"
        >
          <ElInput
            v-model="values.reason"
            type="textarea"
            :rows="4"
            maxlength="500"
            show-word-limit
            :placeholder="t('administrationLifecycle.confirmation.reasonPlaceholder')"
          />
          <p v-if="fieldErrors.reason?.length" class="mt-1 text-xs text-red-700">
            {{ fieldErrors.reason.join(' ') }}
          </p>
        </ElFormItem>
      </ElForm>
    </div>
    <template #footer>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <ElButton :disabled="pending" @click="emit('cancel')">
          {{ t('administrationLifecycle.confirmation.cancel') }}
        </ElButton>
        <ElButton type="primary" :loading="pending" @click="emit('submit')">
          {{ t('administrationLifecycle.confirmation.submit') }}
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>
