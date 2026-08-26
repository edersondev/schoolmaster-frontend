<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  visible: { type: Boolean, default: false },
  pending: { type: Boolean, default: false },
})

const emit = defineEmits(['restore'])
const { t } = useI18n()
</script>

<template>
  <section
    v-if="visible"
    role="status"
    aria-live="polite"
    aria-atomic="true"
    class="mb-4 flex flex-col gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-950 sm:flex-row sm:items-center sm:justify-between"
  >
    <p class="text-sm font-medium">
      {{ t('administration.users.recovery.warning') }}
    </p>
    <ElButton type="warning" plain :loading="pending" :disabled="pending" @click="emit('restore')">
      {{ t('administration.users.recovery.restoreAction') }}
    </ElButton>
  </section>
</template>
