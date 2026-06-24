<script setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { AUTH_SESSION_STATUSES } from '@/contracts/auth/authSession.contract'
import { getPostAuthRoute } from '@/router/authGuards'
import { AUTH_ROUTE_NAMES } from '@/router/modules/auth.routes'
import AuthFeedbackState from '@/components/auth/AuthFeedbackState.vue'

const { t } = useI18n()
const router = useRouter()
const store = useAuthSessionStore()
const { feedbackState } = storeToRefs(store)

async function recover(action) {
  if (action === 'choose-school') {
    await router.replace({ name: AUTH_ROUTE_NAMES.schoolSelection })
    return
  }
  if (action === 'allowed-workspace') {
    await router.replace({ name: 'adminDashboard' })
    return
  }
  if (action === 'retry') {
    try {
      await store.bootstrap({
        requiresSchoolContext: store.requestedRoute?.requiresSchoolContext === true,
      })
    } catch {
      return
    }

    if (store.status === AUTH_SESSION_STATUSES.selectingSchool) {
      await router.replace({ name: AUTH_ROUTE_NAMES.schoolSelection })
      return
    }

    if (store.status === AUTH_SESSION_STATUSES.authenticated) {
      const destination = getPostAuthRoute(store, { name: 'adminDashboard' })
      store.clearRequestedRoute()
      await router.replace(destination)
    }
    return
  }
  await router.replace({ name: AUTH_ROUTE_NAMES.login })
}
</script>

<template>
  <article
    class="grid gap-5 rounded-[1.25rem] bg-white/85 p-8 shadow-[0_1.5rem_4rem_rgba(30,41,59,0.1)]"
  >
    <h2 class="font-display text-3xl font-medium">{{ t('auth.state.title') }}</h2>
    <AuthFeedbackState v-if="feedbackState" :feedback="feedbackState" @recover="recover" />
  </article>
</template>
