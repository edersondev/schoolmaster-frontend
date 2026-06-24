<script setup>
import { getCurrentInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import AuthFeedbackState from '@/components/auth/AuthFeedbackState.vue'

const { t } = useI18n()
const store = useAuthSessionStore()
const { feedbackState } = storeToRefs(store)
const instance = getCurrentInstance()

async function recover(action) {
  const router = instance?.proxy?.$router
  if (!router) {
    return
  }
  if (action === 'choose-school') {
    await router.replace({ name: 'authSchoolSelection' })
    return
  }
  if (action === 'allowed-workspace') {
    await router.replace({ name: 'adminDashboard' })
    return
  }
  await router.replace({ name: 'authLogin' })
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
