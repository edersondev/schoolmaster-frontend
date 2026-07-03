<script setup>
defineProps({
  message: { type: String, default: '' },
})
</script>

<template>
  <div class="sr-only" aria-live="polite" aria-atomic="true">
    {{ message }}
  </div>
</template>
