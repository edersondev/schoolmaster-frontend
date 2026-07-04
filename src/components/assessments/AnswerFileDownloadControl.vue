<script setup>
defineProps({
  file: { type: Object, required: true },
  pending: { type: Boolean, default: false },
})
const emit = defineEmits(['download'])
</script>

<template>
  <div class="flex items-center justify-between gap-3 rounded border border-sm-border p-3">
    <div>
      <p class="text-sm font-medium text-sm-heading">{{ file.displayName }}</p>
      <p class="text-xs text-sm-muted">{{ file.scanStatus }}</p>
    </div>
    <ElButton :disabled="!file.downloadAllowed" :loading="pending" @click="emit('download', file)">Download</ElButton>
  </div>
</template>
