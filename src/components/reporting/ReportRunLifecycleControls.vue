<script setup>
import { Delete, RefreshLeft } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  run: { type: Object, default: null },
  availableActions: { type: Function, required: true },
})
const emit = defineEmits(['action'])
const { t } = useI18n()
const actions = computed(() => props.availableActions(props.run))
</script>

<template>
  <div v-if="run" class="flex flex-wrap gap-2">
    <ElButton v-if="actions.includes('retry')" :icon="RefreshLeft" @click="emit('action', 'retry')">{{ t('reporting.actions.retry') }}</ElButton>
    <ElButton v-if="actions.includes('cancel')" @click="emit('action', 'cancel')">{{ t('reporting.actions.cancel') }}</ElButton>
    <ElButton v-if="actions.includes('delete')" :icon="Delete" type="warning" @click="emit('action', 'delete')">{{ t('reporting.actions.delete') }}</ElButton>
    <ElButton v-if="actions.includes('restore')" @click="emit('action', 'restore')">{{ t('reporting.actions.restore') }}</ElButton>
  </div>
</template>
