<script setup>
import { computed } from 'vue'
import { statusLabel, statusType } from '../services/teacherWorkflowStatus'

const props = defineProps({
  status: { type: String, default: 'unavailable' },
  scanStatus: { type: String, default: '' },
  disabledReason: { type: String, default: '' },
  pending: { type: Boolean, default: false },
  showLifecycle: { type: Boolean, default: true },
})

const emit = defineEmits(['activate', 'deactivate', 'delete', 'restore'])

const canActivate = computed(() => props.status === 'inactive')
const canDeactivate = computed(() => props.status === 'active')
const canDelete = computed(() => props.status !== 'deleted')
const canRestore = computed(() => props.status === 'deleted')
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <ElTag :type="statusType(status)" effect="light">{{ statusLabel(status) }}</ElTag>
    <ElTag v-if="scanStatus" :type="statusType(scanStatus)" effect="plain">
      Scan: {{ statusLabel(scanStatus) }}
    </ElTag>
    <ElTooltip v-if="disabledReason" :content="disabledReason">
      <ElTag type="warning" effect="plain">Action limited</ElTag>
    </ElTooltip>
    <template v-if="showLifecycle">
      <ElButton size="small" :disabled="!canActivate || pending" @click="emit('activate')">
        Activate
      </ElButton>
      <ElButton size="small" :disabled="!canDeactivate || pending" @click="emit('deactivate')">
        Deactivate
      </ElButton>
      <ElButton size="small" type="danger" :disabled="!canDelete || pending" @click="emit('delete')">
        Delete
      </ElButton>
      <ElButton size="small" :disabled="!canRestore || pending" @click="emit('restore')">
        Restore
      </ElButton>
    </template>
  </div>
</template>
