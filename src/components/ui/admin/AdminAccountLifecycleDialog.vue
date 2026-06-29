<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { validateAccountLifecycleAction } from '@/contracts/admin-system/account-lifecycle'

const open = defineModel('open', { type: Boolean, default: false })
const reason = defineModel('reason', { type: String, default: '' })

const props = defineProps({
  action: { type: String, default: '' },
  pending: { type: Boolean, default: false },
  fieldErrors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['submit', 'cancel'])
const { t } = useI18n()
const title = computed(() =>
  t('accountLifecycle.dialog.title', {
    action: props.action ? t(`accountLifecycle.actions.${props.action}`) : '',
  }),
)
const reasonError = computed(() => props.fieldErrors.reason?.join(' ') ?? '')
const requiresReason = computed(() => props.action === 'lock')
const showReason = computed(() => ['lock', 'recover', 'reactivate'].includes(props.action))

function submit() {
  const errors = validateAccountLifecycleAction({ action: props.action, reason: reason.value })
  if (Object.keys(errors).length === 0) {
    emit('submit')
  }
}
</script>

<template>
  <ElDialog v-model="open" :title="title" width="min(92vw, 520px)" @closed="emit('cancel')">
    <ElForm class="grid gap-2" label-position="top" @submit.prevent="submit">
      <ElFormItem
        v-if="showReason"
        :label="t('accountLifecycle.dialog.reason')"
        :required="requiresReason"
        :error="reasonError"
      >
        <ElInput
          v-model="reason"
          type="textarea"
          :rows="4"
          maxlength="500"
          show-word-limit
          :placeholder="t('accountLifecycle.dialog.reasonPlaceholder')"
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <ElButton :disabled="pending" @click="emit('cancel')">
          {{ t('accountLifecycle.dialog.cancel') }}
        </ElButton>
        <ElButton type="primary" :loading="pending" @click="submit">
          {{ t('accountLifecycle.dialog.submit') }}
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

