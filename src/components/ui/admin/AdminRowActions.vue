<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { MoreFilled } from '@element-plus/icons-vue'

const props = defineProps({
  actions: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['action'])
const { t } = useI18n()
const visibleActions = computed(() => props.actions.filter(Boolean))
</script>

<template>
  <ElDropdown
    v-if="visibleActions.length"
    trigger="click"
    :disabled="disabled"
    @command="emit('action', $event)"
  >
    <ElButton :icon="MoreFilled" circle :disabled="disabled" :aria-label="t('administration.common.actions')" />
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem
          v-for="action in visibleActions"
          :key="action"
          :command="action"
          :disabled="disabled"
        >
          {{ t(`administrationLifecycle.actions.${action}`) }}
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>
