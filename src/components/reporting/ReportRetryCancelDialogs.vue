<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  action: { type: String, default: '' },
  reasonCode: { type: String, default: '' },
  reasonOptions: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue', 'update:reasonCode', 'confirm'])
const { t } = useI18n()
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
const reason = computed({
  get: () => props.reasonCode,
  set: (value) => emit('update:reasonCode', value),
})
</script>

<template>
  <ElDialog v-model="visible" :title="t(`reporting.lifecycle.${action}`)" width="420px">
    <ElForm label-position="top">
      <ElFormItem :label="t('reporting.labels.reasonCode')">
        <ElSelect v-model="reason" class="w-full">
          <ElOption v-for="option in reasonOptions" :key="option" :label="option" :value="option" />
        </ElSelect>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="visible = false">{{ t('reporting.actions.cancel') }}</ElButton>
      <ElButton type="primary" @click="emit('confirm')">{{ t('reporting.actions.confirm') }}</ElButton>
    </template>
  </ElDialog>
</template>
