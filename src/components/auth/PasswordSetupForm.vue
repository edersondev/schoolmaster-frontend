<script setup>
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { validateLifecyclePassword } from '@/contracts/auth/account-lifecycle'

const props = defineProps({
  loading: { type: Boolean, default: false },
  fieldErrors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['submit'])
const { t } = useI18n()
const form = reactive({ password: '' })
const localErrors = reactive({ password: [] })

function passwordError() {
  const external = props.fieldErrors.password
  return localErrors.password[0] ?? (Array.isArray(external) ? external[0] : (external ?? ''))
}

function submit() {
  localErrors.password = validateLifecyclePassword(form.password)
  if (localErrors.password.length === 0) {
    emit('submit', { password: form.password })
  }
}
</script>

<template>
  <ElForm class="grid gap-1" label-position="top" :model="form" @submit.prevent="submit">
    <ElFormItem :label="t('accountLifecycle.setup.password')" :error="passwordError()">
      <ElInput
        v-model="form.password"
        type="password"
        name="password"
        autocomplete="new-password"
        size="large"
        show-password
        @keyup.enter="submit"
      />
      <p v-if="passwordError()" class="mt-1 w-full text-xs text-[var(--el-color-danger)]">
        {{ passwordError() }}
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
      {{ t('accountLifecycle.setup.submit') }}
    </ElButton>
  </ElForm>
</template>

