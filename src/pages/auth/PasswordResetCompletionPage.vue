<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { usePasswordResetCompletion } from '@/composables/auth/usePasswordResetCompletion'
import PasswordResetCompletionForm from '@/components/auth/PasswordResetCompletionForm.vue'
import AccountLifecycleTokenState from '@/components/auth/AccountLifecycleTokenState.vue'
import AccountLifecycleSuccessState from '@/components/auth/AccountLifecycleSuccessState.vue'

const route = useRoute()
const router = useRouter()
const store = useAuthSessionStore()
const { t } = useI18n()
const token = computed(() => route.params.token ?? route.query.token ?? '')
const completion = usePasswordResetCompletion({
  token,
  onSuccess: () => store.clearLifecycleSessionAssumptions(),
})

function recover(action) {
  if (action === 'sign-in') {
    router.push({ name: 'authLogin' })
  }
  if (action === 'request-reset') {
    router.push({ name: 'authForgotPassword' })
  }
}
</script>

<template>
  <article
    class="grid gap-[1.35rem] rounded-[1.25rem] border border-sm-brand/15 bg-white/80 p-[clamp(1.5rem,4vw,2.5rem)] shadow-[0_1.5rem_4rem_rgba(30,41,59,0.1)] backdrop-blur-2xl"
  >
    <template v-if="completion.completed.value">
      <AccountLifecycleSuccessState
        title-key="resetCompletion.successTitle"
        message-key="resetCompletion.successMessage"
      />
    </template>
    <template v-else>
      <header>
        <h2 class="font-display text-4xl font-medium">
          {{ t('accountLifecycle.resetCompletion.title') }}
        </h2>
        <p class="mt-2 leading-[1.6] text-sm-muted">
          {{ t('accountLifecycle.resetCompletion.subtitle') }}
        </p>
      </header>
      <AccountLifecycleTokenState
        v-if="completion.feedback.value && completion.feedback.value.state !== 'validation'"
        :feedback="completion.feedback.value"
        @recover="recover"
      />
      <PasswordResetCompletionForm
        v-if="!completion.tokenInvalid.value"
        :loading="completion.pending.value"
        :field-errors="completion.fieldErrors.value"
        @submit="completion.submit"
      />
    </template>
  </article>
</template>

