<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  CircleCheck,
  CloseBold,
  Delete,
  Edit,
  MoreFilled,
  RefreshLeft,
} from '@element-plus/icons-vue'

const props = defineProps({
  actions: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['action'])
const { t } = useI18n()
const actionIcons = Object.freeze({
  activate: CircleCheck,
  deactivate: CloseBold,
  delete: Delete,
  edit: Edit,
  restore: RefreshLeft,
  softDelete: Delete,
})
const actionItemClasses = Object.freeze({
  delete: '!text-red-600',
  softDelete: '!text-red-600',
})
const visibleActions = computed(() => props.actions.filter(Boolean).map(normalizeAction))

function normalizeAction(action) {
  if (typeof action === 'object') {
    const command = action.command ?? action.key
    return {
      key: action.key ?? command,
      command,
      dataTest: action.dataTest,
      disabled: action.disabled ?? false,
      icon: action.icon ?? actionIcons[command],
      itemClass: action.itemClass ?? actionItemClasses[command],
      label: action.label ?? t(action.labelKey ?? `administrationLifecycle.actions.${command}`),
    }
  }

  return {
    key: action,
    command: action,
    disabled: false,
    icon: actionIcons[action],
    itemClass: actionItemClasses[action],
    label: t(`administrationLifecycle.actions.${action}`),
  }
}
</script>

<template>
  <ElDropdown
    v-if="visibleActions.length"
    trigger="click"
    :disabled="disabled"
    @command="emit('action', $event)"
  >
    <ElButton
      :icon="MoreFilled"
      circle
      :disabled="disabled"
      :aria-label="t('administration.common.actions')"
    />
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem
          v-for="action in visibleActions"
          :key="action.key"
          :command="action.command"
          :disabled="disabled || action.disabled"
          :data-test="action.dataTest"
        >
          <ElIcon v-if="action.icon" class="mr-2" :class="action.itemClass">
            <component :is="action.icon" />
          </ElIcon>
          <span :class="action.itemClass">{{ action.label }}</span>
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>
