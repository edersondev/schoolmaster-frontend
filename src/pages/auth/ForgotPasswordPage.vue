<script setup>
import { computed, inject, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm.vue'
import AuthFeedbackState from '@/components/auth/AuthFeedbackState.vue'

const { t } = useI18n()
const store = useAuthSessionStore()
const { feedbackState, passwordResetPending } = storeToRefs(store)
const injectedRequest = inject('passwordResetAction', null)
const localFeedback = shallowRef(null)
const fieldErrors = shallowRef({})
const feedback = computed(() => localFeedback.value ?? feedbackState.value)

async function submit(input) {
  localFeedback.value = null
  fieldErrors.value = {}
  try {
    if (injectedRequest) {
      await injectedRequest(input)
      localFeedback.value = {
        state: 'neutral-confirmation',
        severity: 'info',
        recoveryAction: null,
      }
    } else {
      await store.requestPasswordReset(input)
    }
  } catch (error) {
    localFeedback.value = error.feedback
    fieldErrors.value = error.fieldErrors ?? {}
  }
}
</script>

<template>
  <article
    class="grid gap-[1.35rem] rounded-[1.25rem] border border-sm-brand/15 bg-white/80 p-[clamp(1.5rem,4vw,2.5rem)] shadow-[0_1.5rem_4rem_rgba(30,41,59,0.1)] backdrop-blur-2xl"
  >
    <header>
      <h2 class="font-display text-4xl font-medium tracking-[-0.035em]">
        {{ t('auth.forgotPassword.title') }}
      </h2>
      <p class="mt-[0.55rem] leading-[1.6] text-sm-muted">
        {{ t('auth.forgotPassword.subtitle') }}
      </p>
    </header>

    <AuthFeedbackState v-if="feedback" :feedback="feedback" :show-recovery="false" />
    <ForgotPasswordForm
      :loading="passwordResetPending"
      :field-errors="fieldErrors"
      @submit="submit"
    />

    <RouterLink
      class="justify-self-start font-bold text-sm-brand-strong no-underline hover:underline"
      :to="{ name: 'authLogin' }"
    >
      {{ t('auth.forgotPassword.backToLogin') }}
    </RouterLink>
  </article>
</template>
