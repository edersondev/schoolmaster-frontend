<script setup>
import { computed } from 'vue'

const props = defineProps({
  periods: { type: Array, default: () => [] },
  modelValue: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  blocked: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'change', 'retry'])
const selected = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
    emit('change', value)
  },
})
const currentLabel = computed(() => props.periods.find((period) => period.isCurrent)?.label ?? 'Current period')
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <ElSelect
      v-model="selected"
      class="min-w-64"
      :loading="loading"
      :placeholder="currentLabel"
      :disabled="loading || periods.length === 0"
      aria-label="Academic period"
    >
      <ElOption
        v-for="period in periods"
        :key="period.academicPeriodId"
        :label="period.label"
        :value="period.academicPeriodId"
      />
    </ElSelect>
    <ElTag v-if="blocked" type="warning" effect="light">No current period</ElTag>
    <ElButton v-if="blocked" @click="emit('retry')">Reload</ElButton>
  </div>
</template>
