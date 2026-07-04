<script setup>
defineProps({
  files: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="space-y-2">
    <div v-for="file in files" :key="file.id" class="rounded border border-sm-border p-3">
      <p class="text-sm font-medium text-sm-heading">{{ file.displayName }}</p>
      <p class="text-xs text-sm-muted">{{ file.availabilityState }}</p>
    </div>
  </div>
</template>
