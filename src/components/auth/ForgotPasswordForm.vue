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
const form = reactive({ email: '' })
const localErrors = reactive({ email: '' })

function externalError() {
  const error = props.fieldErrors.email
  return Array.isArray(error) ? error[0] : (error ?? '')
}

function submit() {
  localErrors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ? ''
    : t('auth.validation.emailInvalid')
  if (!localErrors.email) {
    emit('submit', { email: form.email.trim() })
  }
}
</script>

<template>
  <ElForm class="grid gap-1" label-position="top" :model="form" @submit.prevent="submit">
    <ElFormItem :label="t('auth.forgotPassword.email')">
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
        v-if="localErrors.email || externalError()"
        class="mt-[0.35rem] w-full text-[0.78rem] text-[var(--el-color-danger)]"
        role="alert"
      >
        {{ localErrors.email || externalError() }}
      </p>
    </ElFormItem>

    <ElButton
      class="min-h-12 w-full font-bold"
      type="primary"
      size="large"
      native-type="button"
      :loading="loading"
      @click="submit"
    >
      {{ t('auth.forgotPassword.submit') }}
    </ElButton>
  </ElForm>
</template>
