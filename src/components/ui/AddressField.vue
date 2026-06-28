<script setup>
import { computed, ref, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { vMaska } from 'maska/vue'

const model = defineModel({ type: Object, required: true })
const removeAddress = defineModel('removeAddress', { type: Boolean, default: false })
defineProps({
  errors: { type: Object, default: () => ({}) },
  allowRemoveAddress: { type: Boolean, default: false },
})

const { t } = useI18n()
const ZIP_MASK = '#####-###'
const maskedZipCode = ref('')
const zipDigitsValue = computed(() =>
  String(model.value?.zipCode ?? '')
    .replace(/\D/g, '')
    .slice(0, 8),
)
const numberValue = computed({
  get: () => String(model.value?.number ?? ''),
  set: (value) => {
    model.value ??= createBlankAddress()
    model.value.number = String(value ?? '').replace(/\D/g, '')
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

watchEffect(() => {
  model.value ??= createBlankAddress()
})

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
  model.value ??= createBlankAddress()
  model.value.zipCode = event.detail.unmasked
}

watch(zipDigitsValue, syncMaskedZipCode, { immediate: true })
</script>

<template>
  <div class="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
    <div class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h3 class="text-sm font-semibold text-slate-900">
        {{ t('administration.common.address') }}
      </h3>
      <ElCheckbox v-if="allowRemoveAddress" v-model="removeAddress">
        Remove current address
      </ElCheckbox>
    </div>

    <div v-if="!removeAddress" class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
      <ElFormItem label="ZIP code" required :error="errors['address.zip_code']?.[0]">
        <ElInput
          v-model="maskedZipCode"
          v-maska="ZIP_MASK"
          autocomplete="postal-code"
          inputmode="numeric"
          placeholder="00000-000"
          @maska="updateZipCode"
        />
      </ElFormItem>
      <ElFormItem label="Street" required :error="errors['address.street']?.[0]">
        <ElInput v-model="model.street" autocomplete="street-address" />
      </ElFormItem>
      <ElFormItem label="Number" required :error="errors['address.number']?.[0]">
        <ElInput v-model="numberValue" inputmode="numeric" />
      </ElFormItem>
      <ElFormItem label="Complement" :error="errors['address.complement']?.[0]">
        <ElInput v-model="model.complement" />
      </ElFormItem>
      <ElFormItem label="Neighborhood" required :error="errors['address.neighborhood']?.[0]">
        <ElInput v-model="model.neighborhood" />
      </ElFormItem>
      <ElFormItem label="City" required :error="errors['address.city']?.[0]">
        <ElInput v-model="model.city" />
      </ElFormItem>
      <ElFormItem label="State" required :error="errors['address.state']?.[0]">
        <ElInput v-model="model.state" />
      </ElFormItem>
      <ElFormItem label="Country" required :error="errors['address.country']?.[0]">
        <ElInput v-model="model.country" />
      </ElFormItem>
    </div>
  </div>
</template>
