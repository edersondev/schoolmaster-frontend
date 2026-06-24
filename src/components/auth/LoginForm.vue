<script setup>
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  fieldErrors: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['submit'])
const { t } = useI18n()
const form = reactive({
  email: '',
  password: '',
})
const localErrors = reactive({
  email: '',
  password: '',
})

function externalError(field) {
  const error = props.fieldErrors[field]
  return Array.isArray(error) ? error[0] : (error ?? '')
}

function validate() {
  localErrors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ? ''
    : t('auth.validation.emailInvalid')
  localErrors.password = form.password.length >= 8 ? '' : t('auth.validation.passwordMin')
  return !localErrors.email && !localErrors.password
}

function submit() {
  if (!validate()) {
    return
  }
  emit('submit', { email: form.email.trim(), password: form.password })
}
</script>

<template>
  <ElForm class="grid gap-1" label-position="top" :model="form" @submit.prevent="submit">
    <ElFormItem :label="t('auth.login.email')">
      <ElInput
        v-model="form.email"
        type="email"
        name="email"
        autocomplete="email"
        size="large"
        clearable
        @keyup.enter="submit"
      />
      <p
        v-if="localErrors.email || externalError('email')"
        class="mt-[0.35rem] w-full text-[0.78rem] text-[var(--el-color-danger)]"
        role="alert"
      >
        {{ localErrors.email || externalError('email') }}
      </p>
    </ElFormItem>

    <ElFormItem :label="t('auth.login.password')">
      <ElInput
        v-model="form.password"
        type="password"
        name="password"
        autocomplete="current-password"
        size="large"
        show-password
        @keyup.enter="submit"
      />
      <p
        v-if="localErrors.password || externalError('password')"
        class="mt-[0.35rem] w-full text-[0.78rem] text-[var(--el-color-danger)]"
        role="alert"
      >
        {{ localErrors.password || externalError('password') }}
      </p>
    </ElFormItem>

    <ElButton
      class="mt-2 min-h-12 w-full font-bold"
      type="primary"
      size="large"
      native-type="button"
      :loading="loading"
      @click="submit"
    >
      {{ t('auth.login.submit') }}
    </ElButton>
  </ElForm>
</template>
