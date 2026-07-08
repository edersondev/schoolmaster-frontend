<script setup>
import { computed } from 'vue'

const model = defineModel({ type: Object, required: true })
defineProps({
  errors: { type: Object, default: () => ({}) },
  readonlyDocument: { type: Boolean, default: false },
})

const inepCode = computed({
  get: () => String(model.value?.inep_code ?? ''),
  set: (value) => {
    model.value.inep_code = String(value ?? '').replace(/\D/g, '').slice(0, 8)
  },
})
</script>

<template>
  <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
    <ElFormItem label="INEP code" required :error="errors.inep_code?.[0]">
      <ElInput v-model="inepCode" inputmode="numeric" maxlength="8" autocomplete="off" />
    </ElFormItem>

    <ElFormItem label="Name" required :error="errors.name?.[0]">
      <ElInput v-model="model.name" autocomplete="organization" maxlength="255" show-word-limit />
    </ElFormItem>

    <ElFormItem label="CNPJ" required :error="errors.document?.[0]">
      <CnpjField v-model="model.document" :readonly="readonlyDocument" />
    </ElFormItem>

    <ElFormItem label="Trade name" :error="errors.trade_name?.[0]">
      <ElInput v-model="model.trade_name" autocomplete="organization" maxlength="255" show-word-limit />
    </ElFormItem>

    <ElFormItem label="Legal name" :error="errors.legal_name?.[0]">
      <ElInput v-model="model.legal_name" autocomplete="organization" maxlength="255" show-word-limit />
    </ElFormItem>

    <ElFormItem label="Email" required :error="errors.email?.[0]">
      <ElInput v-model="model.email" type="email" autocomplete="email" maxlength="100" show-word-limit />
    </ElFormItem>

    <ElFormItem label="Phone" :error="errors.phone?.[0]">
      <PhoneField v-model="model.phone" />
    </ElFormItem>

    <ElFormItem label="Website" :error="errors.website?.[0]">
      <ElInput v-model="model.website" type="url" autocomplete="url" maxlength="100" show-word-limit />
    </ElFormItem>

    <ElFormItem label="Description" class="sm:col-span-2" :error="errors.description?.[0]">
      <ElInput v-model="model.description" type="textarea" :rows="3" maxlength="500" show-word-limit />
    </ElFormItem>

    <ElFormItem label="Status" required :error="errors.status?.[0]">
      <ElSwitch
        v-model="model.status"
        :active-value="1"
        :inactive-value="0"
        active-text="Active"
        inactive-text="Inactive"
      />
    </ElFormItem>
  </div>
</template>
