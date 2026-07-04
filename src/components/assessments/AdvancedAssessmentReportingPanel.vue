<script setup>
defineProps({
  fields: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['request'])
</script>

<template>
  <section class="space-y-4 rounded border border-sm-border p-4">
    <div class="flex flex-wrap gap-2">
      <ElTag v-for="field in fields" :key="field" type="info" effect="plain">{{ field }}</ElTag>
    </div>
    <ElButton type="primary" :loading="loading" @click="emit('request')">Request aggregate report</ElButton>
  </section>
</template>
