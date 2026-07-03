<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  reasonCode: { type: String, default: '' },
  pendingAction: { type: String, default: '' },
  canApprove: { type: Boolean, default: false },
  canRevoke: { type: Boolean, default: false },
})
const emit = defineEmits(['update-reason', 'approve', 'revoke'])
const { t } = useI18n()
</script>

<template>
  <section class="space-y-3 rounded border border-slate-200 bg-white p-4">
    <h2 class="text-lg font-semibold text-slate-900">{{ t('platformSupport.labels.approval') }}</h2>
    <ElInput :model-value="reasonCode" :placeholder="t('platformSupport.labels.reasonCode')" @update:model-value="emit('update-reason', $event)" />
    <div class="flex flex-wrap gap-2">
      <ElButton type="primary" :disabled="!canApprove" :loading="pendingAction === 'approve'" @click="emit('approve')">
        {{ t('platformSupport.actions.approve') }}
      </ElButton>
      <ElButton type="warning" :disabled="!canRevoke" :loading="pendingAction === 'revoke'" @click="emit('revoke')">
        {{ t('platformSupport.actions.revoke') }}
      </ElButton>
    </div>
  </section>
</template>

