<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  action: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['recover'])
const { t } = useI18n()

const actionLabel = computed(() => {
  const labels = {
    'sign-in': 'recovery.signIn',
    'choose-school': 'recovery.chooseSchool',
    'allowed-workspace': 'recovery.allowedWorkspace',
    retry: 'recovery.retry',
  }
  return labels[props.action] ? t(`auth.${labels[props.action]}`) : null
})
</script>

<template>
  <div v-if="actionLabel" class="mt-4">
    <ElButton type="primary" plain @click="emit('recover', action)">
      {{ actionLabel }}
    </ElButton>
  </div>
</template>
