<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  status: { type: String, default: '' },
  showStatus: { type: Boolean, default: false },
  sort: { type: String, default: '' },
  sortOptions: { type: Array, default: () => [] },
})
defineEmits(['update:status', 'update:sort', 'reset'])
const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
    <ElFormItem
      v-if="showStatus"
      :label="t('administration.common.status')"
      class="!mb-0 min-w-48"
    >
      <ElSelect
        :model-value="status"
        :aria-label="t('administration.common.status')"
        @update:model-value="$emit('update:status', $event)"
      >
        <ElOption :label="t('administration.common.allStatuses')" value="" />
        <ElOption :label="t('administration.common.active')" value="active" />
        <ElOption :label="t('administration.common.inactive')" value="inactive" />
      </ElSelect>
    </ElFormItem>
    <ElFormItem
      v-if="sortOptions.length"
      :label="t('administration.common.sort')"
      class="!mb-0 min-w-48"
    >
      <ElSelect
        :model-value="sort"
        :aria-label="t('administration.common.sort')"
        @update:model-value="$emit('update:sort', $event)"
      >
        <ElOption :label="t('administration.common.defaultSort')" value="" />
        <ElOption
          v-for="option in sortOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </ElSelect>
    </ElFormItem>
    <slot />
    <ElFormItem class="!mb-0 min-w-48">
      <template #label>
        <span aria-hidden="true" class="select-none text-transparent">
          {{ t('administration.common.resetFilters') }}
        </span>
      </template>
      <ElButton @click="$emit('reset')">{{ t('administration.common.resetFilters') }}</ElButton>
    </ElFormItem>
  </div>
</template>
