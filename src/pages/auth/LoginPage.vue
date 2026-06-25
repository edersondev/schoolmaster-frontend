<script setup>
import { computed, getCurrentInstance, inject, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { getPostAuthRoute } from '@/router/authGuards'
import { getAdminFallbackRoute } from '@/router/adminFallbackRoute'
import LoginForm from '@/components/auth/LoginForm.vue'
import AuthFeedbackState from '@/components/auth/AuthFeedbackState.vue'

const { t } = useI18n()
const store = useAuthSessionStore()
const { feedbackState } = storeToRefs(store)
const instance = getCurrentInstance()
const injectedLogin = inject('authLoginAction', null)
const localFeedback = shallowRef(null)
const fieldErrors = shallowRef({})
const loading = shallowRef(false)
const feedback = computed(() => localFeedback.value ?? feedbackState.value)

async function submit(credentials) {
  loading.value = true
  localFeedback.value = null
  fieldErrors.value = {}
  try {
    if (injectedLogin) {
      await injectedLogin(credentials)
    } else {
      await store.login(credentials)
      const router = instance?.proxy?.$router
      if (router) {
        const destination = getPostAuthRoute(store, getAdminFallbackRoute(store))
        store.clearRequestedRoute()
        await router.replace(destination)
      }
    }
  } catch (error) {
    localFeedback.value = error.feedback
    fieldErrors.value = error.fieldErrors ?? {}
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <article
    class="grid gap-[1.35rem] rounded-[1.25rem] border border-sm-brand/15 bg-white/80 p-[clamp(1.5rem,4vw,2.5rem)] shadow-[0_1.5rem_4rem_rgba(30,41,59,0.1)] backdrop-blur-2xl"
  >
    <header>
      <h2 class="font-display text-4xl font-medium tracking-[-0.035em]">
        {{ t('auth.login.title') }}
      </h2>
      <p class="mt-[0.55rem] leading-[1.6] text-sm-muted">
        {{ t('auth.login.subtitle') }}
      </p>
    </header>

    <AuthFeedbackState v-if="feedback" :feedback="feedback" :show-recovery="false" />
    <LoginForm :loading="loading" :field-errors="fieldErrors" @submit="submit" />

    <RouterLink
      class="justify-self-start font-bold text-sm-brand-strong no-underline hover:underline"
      :to="{ name: 'authForgotPassword' }"
    >
      {{ t('auth.login.forgotPassword') }}
    </RouterLink>
  </article>
</template>
