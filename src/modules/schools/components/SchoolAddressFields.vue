<script setup>
import { computed, shallowRef, watch } from 'vue'
import { vMaska } from 'maska/vue'

const model = defineModel({ type: Object, required: true })
defineProps({
  errors: { type: Object, default: () => ({}) },
})

const ZIP_MASK = '#####-###'
const maskedZipCode = shallowRef('')
const zipDigitsValue = computed(() =>
  String(model.value?.address?.zipCode ?? '')
    .replace(/\D/g, '')
    .slice(0, 8),
)
const numberValue = computed({
  get: () => String(model.value?.address?.number ?? ''),
  set: (value) => {
    ensureAddress().number = String(value ?? '').replace(/\D/g, '')
  },
})

function createBlankAddress() {
  return {
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  }
}

function ensureAddress() {
  model.value.address ??= createBlankAddress()
  return model.value.address
}

function formatMaskedZipCode(value) {
  const digits = String(value ?? '').replace(/\D/g, '').slice(0, 8)
  if (!digits) return ''
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`
}

function syncMaskedZipCode(nextValue) {
  const nextMasked = formatMaskedZipCode(nextValue)
  if (maskedZipCode.value !== nextMasked) {
    maskedZipCode.value = nextMasked
  }
}

function updateZipCode(event) {
  ensureAddress().zipCode = event.detail?.unmasked ?? ''
}

watch(zipDigitsValue, syncMaskedZipCode, { immediate: true })
</script>

<template>
  <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
    <ElFormItem label="ZIP code" required :error="errors['address.zip_code']?.[0]">
      <ElInput
        v-model="maskedZipCode"
        v-maska="ZIP_MASK"
        inputmode="numeric"
        maxlength="9"
        autocomplete="postal-code"
        placeholder="00000-000"
        @maska="updateZipCode"
      />
    </ElFormItem>

    <ElFormItem label="Street" required :error="errors['address.street']?.[0]">
      <ElInput v-model="model.address.street" autocomplete="street-address" />
    </ElFormItem>

    <ElFormItem label="Number" required :error="errors['address.number']?.[0]">
      <ElInput v-model="numberValue" inputmode="numeric" autocomplete="off" />
    </ElFormItem>

    <ElFormItem label="Complement" :error="errors['address.complement']?.[0]">
      <ElInput v-model="model.address.complement" autocomplete="address-line2" />
    </ElFormItem>

    <ElFormItem label="Neighborhood" required :error="errors['address.neighborhood']?.[0]">
      <ElInput v-model="model.address.neighborhood" />
    </ElFormItem>

    <ElFormItem label="City" required :error="errors['address.city']?.[0]">
      <ElInput v-model="model.address.city" autocomplete="address-level2" />
    </ElFormItem>

    <ElFormItem label="State" required :error="errors['address.state']?.[0]">
      <ElInput v-model="model.address.state" autocomplete="address-level1" />
    </ElFormItem>

    <ElFormItem label="Country" :error="errors['address.country']?.[0]">
      <ElInput v-model="model.address.country" autocomplete="country-name" />
    </ElFormItem>
  </div>
</template>
