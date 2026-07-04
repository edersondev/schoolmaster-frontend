<script setup>
import { computed, ref, watch } from 'vue'
import { vMaska } from 'maska/vue'
import { formatCnpj, normalizeCnpj } from '@/utils/cnpj'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '00.000.000/0000-00' },
  readonly: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const MASK = '##.###.###/####-##'
const maskedValue = ref('')
const digitsValue = computed(() => normalizeCnpj(props.modelValue))

function syncMaskedValue(nextValue) {
  const nextMasked = formatCnpj(nextValue)
  if (maskedValue.value !== nextMasked) {
    maskedValue.value = nextMasked
  }
}

function updateUnmaskedValue(event) {
  emit('update:modelValue', normalizeCnpj(event.detail.unmasked))
}

watch(digitsValue, syncMaskedValue, { immediate: true })
</script>

<template>
  <ElInput
    v-model="maskedValue"
    v-maska="MASK"
    :placeholder="placeholder"
    :readonly="readonly"
    autocomplete="off"
    inputmode="numeric"
    @maska="updateUnmaskedValue"
  />
</template>
