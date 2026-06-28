<script setup>
import { computed, ref, watch } from 'vue'
import { vMaska } from 'maska/vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '(00) 00000-0000' },
})

const emit = defineEmits(['update:modelValue'])

const MASK = '(##) #####-####'
const maskedValue = ref('')
const digitsValue = computed(() => String(props.modelValue ?? '').replace(/\D/g, '').slice(0, 11))

function formatMaskedPhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '').slice(0, 11)
  if (!digits) return ''

  const area = digits.slice(0, 2)
  const firstBlock = digits.slice(2, 7)
  const secondBlock = digits.slice(7, 11)

  if (digits.length <= 2) return `(${area}`
  if (digits.length <= 7) return `(${area}) ${firstBlock}`
  return `(${area}) ${firstBlock}-${secondBlock}`
}

function syncMaskedValue(nextValue) {
  const nextMasked = formatMaskedPhone(nextValue)
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
    v-maska="MASK"
    :placeholder="placeholder"
    autocomplete="tel"
    @maska="updateUnmaskedValue"
  />
</template>
