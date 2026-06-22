<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  notice: {
    type: Object,
    required: true,
  },
})

const { t } = useI18n()
</script>

<template>
  <ElCard class="notice-placeholder" shadow="never">
    <span class="notice-placeholder__title">{{ t(`adminSystem.${notice.titleKey}`) }}</span>
    <p class="notice-placeholder__message">{{ t(`adminSystem.${notice.messageKey}`) }}</p>
  </ElCard>
</template>

<style scoped>
.notice-placeholder {
  border-radius: 8px;
}

.notice-placeholder__title {
  font-weight: 700;
}

.notice-placeholder__message {
  margin: 0.5rem 0 0;
  color: var(--sm-color-muted);
}
</style>
