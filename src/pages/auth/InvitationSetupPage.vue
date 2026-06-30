<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { useInvitationSetup } from '@/composables/auth/useInvitationSetup'
import PasswordSetupForm from '@/components/auth/PasswordSetupForm.vue'
import AccountLifecycleTokenState from '@/components/auth/AccountLifecycleTokenState.vue'
import AccountLifecycleSuccessState from '@/components/auth/AccountLifecycleSuccessState.vue'

const route = useRoute()
const router = useRouter()
const store = useAuthSessionStore()
const { t } = useI18n()
const token = computed(() => route.params.invitationToken ?? route.query.token ?? '')
const setup = useInvitationSetup({
  token,
  onSuccess: () => store.clearLifecycleSessionAssumptions(),
})

function recover(action) {
  if (action === 'sign-in' || action === 'request-reset') {
    router.push({ name: 'authLogin' })
  }
}
</script>

<template>
  <article
    class="grid gap-[1.35rem] rounded-[1.25rem] border border-sm-brand/15 bg-white/80 p-[clamp(1.5rem,4vw,2.5rem)] shadow-[0_1.5rem_4rem_rgba(30,41,59,0.1)] backdrop-blur-2xl"
  >
    <template v-if="setup.completed.value">
      <AccountLifecycleSuccessState
        title-key="setup.successTitle"
        message-key="setup.successMessage"
      />
    </template>
    <template v-else>
      <header>
        <h2 class="font-display text-4xl font-medium">
          {{ t('accountLifecycle.setup.title') }}
        </h2>
        <p class="mt-2 leading-[1.6] text-sm-muted">
          {{ t('accountLifecycle.setup.subtitle') }}
        </p>
      </header>
      <AccountLifecycleTokenState
        v-if="setup.feedback.value && setup.feedback.value.state !== 'validation'"
        :feedback="setup.feedback.value"
        @recover="recover"
      />
      <PasswordSetupForm
        v-if="!setup.tokenInvalid.value"
        :loading="setup.pending.value"
        :field-errors="setup.fieldErrors.value"
        @submit="setup.submit"
      />
    </template>
  </article>
</template>
