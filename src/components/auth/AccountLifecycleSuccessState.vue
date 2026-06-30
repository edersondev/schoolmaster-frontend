<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  titleKey: { type: String, default: 'setup.successTitle' },
  messageKey: { type: String, default: 'setup.successMessage' },
})

const { t } = useI18n()
</script>

<template>
  <section class="grid gap-4" role="status" aria-live="polite">
    <ElResult
      icon="success"
      :title="t(`accountLifecycle.${titleKey}`)"
      :sub-title="t(`accountLifecycle.${messageKey}`)"
    >
      <template #extra>
        <RouterLink :to="{ name: 'authLogin' }">
          <ElButton type="primary">
            {{ t('accountLifecycle.recovery.signIn') }}
          </ElButton>
        </RouterLink>
      </template>
    </ElResult>
  </section>
</template>

