<script setup>
import { computed, ref, watch } from 'vue'
import { vMaska } from 'maska/vue'
import { formatPhone, normalizePhone, PHONE_MASK } from '@/utils/phone'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '(00) 00000-0000' },
})

const emit = defineEmits(['update:modelValue'])

const maskedValue = ref('')
const digitsValue = computed(() => normalizePhone(props.modelValue))

function syncMaskedValue(nextValue) {
  const nextMasked = formatPhone(nextValue)
  if (maskedValue.value !== nextMasked) {
    maskedValue.value = nextMasked
  }
}

function updateUnmaskedValue(event) {
  emit('update:modelValue', event.detail.unmasked)
}

watch(digitsValue, syncMaskedValue, { immediate: true })
</script>

<template>
  <ElInput
    v-model="maskedValue"
    v-maska="PHONE_MASK"
    :placeholder="placeholder"
    autocomplete="tel"
    @maska="updateUnmaskedValue"
  />
</template>
