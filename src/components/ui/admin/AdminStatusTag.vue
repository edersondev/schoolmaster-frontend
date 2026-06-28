<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getStatusCategory } from '@/contracts/admin-system/lifecycle'

const props = defineProps({
  status: { type: String, default: '' },
  compact: { type: Boolean, default: false },
})

const { t } = useI18n()
const category = computed(() => getStatusCategory(props.status))
const tagType = computed(() => {
  if (category.value === 'active') return 'success'
  if (category.value === 'inactive') return 'warning'
  if (category.value === 'deleted') return 'danger'
  if (category.value === 'pending') return 'info'
  return 'info'
})
const label = computed(() =>
  t(`administrationLifecycle.status.${props.status || 'unknown'}`, props.status || 'Unknown'),
)
</script>

<template>
  <ElTag
    :type="tagType"
    :size="compact ? 'small' : 'default'"
    effect="light"
    :aria-label="label"
  >
    {{ label }}
  </ElTag>
</template>
