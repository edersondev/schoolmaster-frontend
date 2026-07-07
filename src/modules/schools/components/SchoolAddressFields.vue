<script setup>
const model = defineModel({ type: Object, required: true })
defineProps({
  errors: { type: Object, default: () => ({}) },
})
</script>

<template>
  <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
    <ElFormItem label="ZIP code" required :error="errors['address.zip_code']?.[0]">
      <ElInput v-model="model.address.zipCode" inputmode="numeric" maxlength="8" autocomplete="postal-code" />
    </ElFormItem>

    <ElFormItem label="Street" required :error="errors['address.street']?.[0]">
      <ElInput v-model="model.address.street" autocomplete="street-address" />
    </ElFormItem>

    <ElFormItem label="Number" required :error="errors['address.number']?.[0]">
      <ElInput v-model="model.address.number" inputmode="numeric" autocomplete="off" />
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
