<script setup>
import { useI18n } from 'vue-i18n'

const model = defineModel({ type: Object, required: true })
defineProps({
  errors: { type: Object, default: () => ({}) },
  allowRemoveAddress: { type: Boolean, default: false },
})
const { t } = useI18n()
</script>

<template>
  <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
    <ElFormItem :label="t('administration.common.name')" required :error="errors.name?.[0]">
      <ElInput v-model="model.name" autocomplete="organization" />
    </ElFormItem>
    <ElFormItem :label="t('administration.common.code')" required :error="errors.code?.[0]">
      <ElInput v-model="model.code" />
    </ElFormItem>
    <ElFormItem :label="t('administration.common.email')" :error="errors.contact_email?.[0]">
      <ElInput v-model="model.contactEmail" type="email" autocomplete="email" />
    </ElFormItem>
    <ElFormItem :label="t('administration.common.phone')" :error="errors.contact_phone?.[0]">
      <PhoneField v-model="model.contactPhone" />
    </ElFormItem>
    <AddressField
      v-model="model.address"
      v-model:remove-address="model.removeAddress"
      class="sm:col-span-2"
      :allow-remove-address="allowRemoveAddress"
      :errors="errors"
    />
  </div>
</template>
