<script setup>
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePasswordResetRequest } from '@/composables/auth/usePasswordResetRequest'
import AuthFeedbackState from '@/components/auth/AuthFeedbackState.vue'

const { t } = useI18n()
const request = usePasswordResetRequest()
const form = reactive({ email: '' })

function externalError() {
  const error = request.fieldErrors.value.email
  return Array.isArray(error) ? error[0] : (error ?? '')
}

async function submit() {
  try {
    await request.submit({ email: form.email })
  } catch {
    // Normalized feedback is rendered from composable state.
  }
}
</script>

<template>
  <article
    class="grid gap-[1.35rem] rounded-[1.25rem] border border-sm-brand/15 bg-white/80 p-[clamp(1.5rem,4vw,2.5rem)] shadow-[0_1.5rem_4rem_rgba(30,41,59,0.1)] backdrop-blur-2xl"
  >
    <header>
      <h2 class="font-display text-4xl font-medium">
        {{ t('accountLifecycle.resetRequest.title') }}
      </h2>
      <p class="mt-2 leading-[1.6] text-sm-muted">
        {{ t('accountLifecycle.resetRequest.subtitle') }}
      </p>
    </header>
    <AuthFeedbackState
      v-if="request.feedback.value"
      :feedback="request.feedback.value"
      :show-recovery="false"
    />
    <ElForm class="grid gap-1" label-position="top" :model="form" @submit.prevent="submit">
      <ElFormItem :label="t('accountLifecycle.resetRequest.email')" :error="externalError()">
        <ElInput
          v-model="form.email"
          type="email"
          name="email"
          autocomplete="email"
          size="large"
          clearable
          @keyup.enter="submit"
        />
        <p v-if="externalError()" class="mt-1 w-full text-xs text-[var(--el-color-danger)]">
          {{ externalError() }}
        </p>
      </ElFormItem>
      <ElButton
        class="min-h-12 w-full font-bold"
        type="primary"
        size="large"
        native-type="button"
        :loading="request.pending.value"
        @click="submit"
      >
        {{ t('accountLifecycle.resetRequest.submit') }}
      </ElButton>
    </ElForm>
    <RouterLink
      class="justify-self-start font-bold text-sm-brand-strong no-underline hover:underline"
      :to="{ name: 'authLogin' }"
    >
      {{ t('auth.forgotPassword.backToLogin') }}
    </RouterLink>
  </article>
</template>

