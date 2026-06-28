<script setup>
import { useI18n } from 'vue-i18n'

const model = defineModel({ type: Object, required: true })
defineProps({
  errors: { type: Object, default: () => ({}) },
  allowRemoveAddress: { type: Boolean, default: false },
  readonlyCode: { type: Boolean, default: false },
  showStatus: { type: Boolean, default: false },
})
const { t } = useI18n()
</script>

<template>
  <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
    <ElFormItem :label="t('administration.common.name')" required :error="errors.name?.[0]">
      <ElInput v-model="model.name" autocomplete="organization" />
    </ElFormItem>
    <ElFormItem :label="t('administration.common.code')" required :error="errors.code?.[0]">
      <ElInput v-model="model.code" :readonly="readonlyCode" />
    </ElFormItem>
    <ElFormItem
      v-if="showStatus"
      :label="t('administration.common.status')"
      :error="errors.status?.[0]"
    >
      <ElSelect v-model="model.status" class="w-full">
        <ElOption :label="t('administration.common.active')" value="active" />
        <ElOption :label="t('administration.common.inactive')" value="inactive" />
      </ElSelect>
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
