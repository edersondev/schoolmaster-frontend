<script setup>
import { toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAccountInvitation } from '@/composables/admin-system/useAccountInvitation'
import { adminAccountLifecycleService } from '@/services/admin-system/accountLifecycle'

const props = defineProps({
  user: { type: Object, default: null },
  schoolId: { type: String, default: null },
  actorId: { type: String, default: null },
  permissions: { type: Array, default: () => [] },
  roles: { type: Array, default: () => [] },
  service: { type: Object, default: () => adminAccountLifecycleService },
})

const emit = defineEmits(['created'])
const { t } = useI18n()
const invitationFlow = useAccountInvitation({
  target: toRef(props, 'user'),
  schoolId: toRef(props, 'schoolId'),
  actorId: toRef(props, 'actorId'),
  permissions: toRef(props, 'permissions'),
  roles: toRef(props, 'roles'),
  service: props.service,
})

async function createInvitation() {
  try {
    const response = await invitationFlow.create()
    if (response) emit('created', response)
  } catch {
    // The composable owns normalized feedback and retry state.
  }
}
</script>

<template>
  <section
    v-if="invitationFlow.eligibility.value.canInvite"
    class="grid gap-4 border-t border-sm-border pt-6"
  >
    <header class="grid gap-1">
      <h3 class="text-base font-semibold text-sm-ink">
        {{ t('accountLifecycle.invitation.title') }}
      </h3>
      <p class="text-sm text-sm-muted">
        {{ t('accountLifecycle.invitation.createHint') }}
      </p>
    </header>

    <ElAlert
      v-if="invitationFlow.error.value"
      :title="
        t(`administrationLifecycle.${invitationFlow.error.value.messageKey ?? 'conflict.unknown'}`)
      "
      type="error"
      :closable="false"
      show-icon
    />

    <dl
      v-if="invitationFlow.invitation.value"
      class="grid gap-2 text-sm text-sm-muted sm:grid-cols-2"
    >
      <div>
        <dt class="font-medium text-sm-ink">{{ t('accountLifecycle.invitation.status') }}</dt>
        <dd>{{ invitationFlow.invitation.value.status }}</dd>
      </div>
      <div>
        <dt class="font-medium text-sm-ink">{{ t('accountLifecycle.invitation.expiry') }}</dt>
        <dd>{{ invitationFlow.invitation.value.expiresAt }}</dd>
      </div>
      <div>
        <dt class="font-medium text-sm-ink">{{ t('accountLifecycle.invitation.delivery') }}</dt>
        <dd>{{ invitationFlow.invitation.value.deliveryRequestedAt ?? '-' }}</dd>
      </div>
      <div>
        <dt class="font-medium text-sm-ink">
          {{ t('accountLifecycle.invitation.deliveryChannel') }}
        </dt>
        <dd>{{ invitationFlow.invitation.value.deliveryChannel ?? '-' }}</dd>
      </div>
    </dl>
    <p v-else class="text-sm text-sm-muted">
      {{ t('accountLifecycle.invitation.empty') }}
    </p>

    <ElButton
      type="primary"
      :loading="invitationFlow.pending.value"
      :disabled="!invitationFlow.canCreate.value"
      @click="createInvitation"
    >
      {{ t('accountLifecycle.invitation.create') }}
    </ElButton>
  </section>
</template>
