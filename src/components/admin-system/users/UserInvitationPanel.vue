<script setup>
import { computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { deriveAccountLifecycleEligibility } from '@/contracts/admin-system/account-lifecycle'
import { adminAccountLifecycleService } from '@/services/admin-system/accountLifecycle'

const props = defineProps({
  user: { type: Object, default: null },
  schoolId: { type: String, default: null },
  permissions: { type: Array, default: () => [] },
  service: { type: Object, default: () => adminAccountLifecycleService },
})

const emit = defineEmits(['created'])
const { t } = useI18n()
const pending = shallowRef(false)
const invitation = shallowRef(null)
const error = shallowRef(null)
const eligibility = computed(() =>
  deriveAccountLifecycleEligibility({
    target: props.user,
    permissions: props.permissions,
    schoolReady: Boolean(props.schoolId),
  }),
)
const canCreate = computed(() => eligibility.value.canInvite && props.user)

async function createInvitation() {
  if (!canCreate.value) return
  pending.value = true
  error.value = null
  try {
    const response = await props.service.createAccountInvitation(
      {
        scope: props.schoolId ? 'school' : 'platform',
        schoolId: props.schoolId,
        fullName: props.user.fullName,
        email: props.user.email,
        roleIds: (props.user.roles ?? []).map((role) => role.id).filter(Boolean),
      },
      { schoolId: props.schoolId },
    )
    invitation.value = response
    emit('created', response)
  } catch (createError) {
    error.value = createError
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <section class="grid gap-4 border-t border-sm-border pt-6">
    <header class="grid gap-1">
      <h3 class="text-base font-semibold text-sm-ink">
        {{ t('accountLifecycle.invitation.title') }}
      </h3>
      <p class="text-sm text-sm-muted">
        {{ t('accountLifecycle.invitation.createHint') }}
      </p>
    </header>

    <ElAlert
      v-if="eligibility.blocked"
      :title="t('accountLifecycle.feedback.permissionSourceBlocked')"
      type="info"
      :closable="false"
      show-icon
    />
    <ElAlert
      v-if="error"
      :title="t(`administrationLifecycle.${error.messageKey ?? 'conflict.unknown'}`)"
      type="error"
      :closable="false"
      show-icon
    />

    <dl v-if="invitation" class="grid gap-2 text-sm text-sm-muted sm:grid-cols-2">
      <div>
        <dt class="font-medium text-sm-ink">{{ t('accountLifecycle.invitation.status') }}</dt>
        <dd>{{ invitation.status }}</dd>
      </div>
      <div>
        <dt class="font-medium text-sm-ink">{{ t('accountLifecycle.invitation.expiry') }}</dt>
        <dd>{{ invitation.expiresAt }}</dd>
      </div>
      <div>
        <dt class="font-medium text-sm-ink">{{ t('accountLifecycle.invitation.delivery') }}</dt>
        <dd>{{ invitation.deliveryRequestedAt ?? '-' }}</dd>
      </div>
      <div>
        <dt class="font-medium text-sm-ink">{{ t('accountLifecycle.invitation.deliveryChannel') }}</dt>
        <dd>{{ invitation.deliveryChannel ?? '-' }}</dd>
      </div>
    </dl>
    <p v-else class="text-sm text-sm-muted">
      {{ t('accountLifecycle.invitation.empty') }}
    </p>

    <ElAlert
      :title="t('accountLifecycle.invitation.resendBlocked')"
      type="warning"
      :closable="false"
      show-icon
    />

    <ElButton type="primary" :loading="pending" :disabled="!canCreate" @click="createInvitation">
      {{ t('accountLifecycle.invitation.create') }}
    </ElButton>
  </section>
</template>

