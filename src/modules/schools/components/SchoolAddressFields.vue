<script setup>
import { computed, shallowRef, watch } from 'vue'
import { vMaska } from 'maska/vue'
import { schoolModuleService } from '../services/schoolService'

const model = defineModel({ type: Object, required: true })
const props = defineProps({
  errors: { type: Object, default: () => ({}) },
  lookupAddress: { type: Function, default: schoolModuleService.lookupAddressByZipCode },
})

const ZIP_MASK = '#####-###'
const maskedZipCode = shallowRef('')
const zipLookupStatus = shallowRef('idle')
const zipLookupError = shallowRef(null)
const lastRequestedZipCode = shallowRef('')
const lookupToken = shallowRef(0)
const zipDigitsValue = computed(() =>
  String(model.value?.address?.zipCode ?? '')
    .replace(/\D/g, '')
    .slice(0, 8),
)
const zipCodeError = computed(() => props.errors['address.zip_code']?.[0] ?? zipLookupError.value)
const zipValidateStatus = computed(() => (zipLookupStatus.value === 'loading' ? 'validating' : undefined))
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
  const detail = event.detail ?? {}
  const zipCode = String(detail.unmasked ?? '').replace(/\D/g, '').slice(0, 8)

  ensureAddress().zipCode = zipCode

  if (!detail.completed) {
    zipLookupError.value = null
    return
  }

  lookupCompletedZipCode(zipCode)
}

async function lookupCompletedZipCode(zipCode) {
  if (!/^\d{8}$/.test(zipCode) || zipCode === lastRequestedZipCode.value) {
    return
  }

  const token = lookupToken.value + 1
  lookupToken.value = token
  lastRequestedZipCode.value = zipCode
  zipLookupStatus.value = 'loading'
  zipLookupError.value = null

  try {
    const address = await props.lookupAddress(zipCode)
    if (lookupToken.value !== token || zipDigitsValue.value !== zipCode) {
      return
    }

    applyAddressLookup(address)
    zipLookupStatus.value = 'ready'
  } catch {
    if (lookupToken.value !== token) {
      return
    }

    zipLookupStatus.value = 'error'
    zipLookupError.value = 'Address lookup unavailable.'
    lastRequestedZipCode.value = ''
  }
}

function applyAddressLookup(address = {}) {
  const target = ensureAddress()
  target.street = address.street ?? ''
  target.neighborhood = address.neighborhood ?? ''
  target.city = address.city ?? ''
  target.state = address.state ?? ''
  target.country = address.country ?? 'Brazil'
}

watch(zipDigitsValue, syncMaskedZipCode, { immediate: true })
</script>

<template>
  <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
    <ElFormItem
      label="ZIP code"
      required
      :error="zipCodeError"
      :validate-status="zipValidateStatus"
    >
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
      <ElInput v-model="model.address.street" autocomplete="street-address" readonly />
    </ElFormItem>

    <ElFormItem label="Number" required :error="errors['address.number']?.[0]">
      <ElInput v-model="numberValue" inputmode="numeric" autocomplete="off" />
    </ElFormItem>

    <ElFormItem label="Complement" :error="errors['address.complement']?.[0]">
      <ElInput v-model="model.address.complement" maxlength="255" autocomplete="address-line2" />
    </ElFormItem>

    <ElFormItem label="Neighborhood" required :error="errors['address.neighborhood']?.[0]">
      <ElInput v-model="model.address.neighborhood" readonly />
    </ElFormItem>

    <ElFormItem label="City" required :error="errors['address.city']?.[0]">
      <ElInput v-model="model.address.city" autocomplete="address-level2" readonly />
    </ElFormItem>

    <ElFormItem label="State" required :error="errors['address.state']?.[0]">
      <ElInput v-model="model.address.state" autocomplete="address-level1" readonly />
    </ElFormItem>

    <ElFormItem label="Country" :error="errors['address.country']?.[0]">
      <ElInput v-model="model.address.country" autocomplete="country-name" readonly />
    </ElFormItem>
  </div>
</template>
