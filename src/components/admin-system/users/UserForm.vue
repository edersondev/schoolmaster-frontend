<script setup>
import AdminLookupSelect from '@/components/ui/admin/AdminLookupSelect.vue'
import { useI18n } from 'vue-i18n'

const model = defineModel({ type: Object, required: true })
defineProps({
  errors: { type: Object, default: () => ({}) },
  roles: { type: Array, default: () => [] },
  rolesLoading: { type: Boolean, default: false },
  showStatus: { type: Boolean, default: false },
  lookupMeta: {
    type: Object,
    default: () => ({ page: 1, perPage: 25, total: 0 }),
  },
})
defineEmits(['lookup-page'])
const { t } = useI18n()
</script>
<template>
  <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
    <ElFormItem
      :label="t('administration.common.fullName')"
      required
      :error="errors.full_name?.[0]"
    >
      <ElInput v-model="model.fullName" autocomplete="name" />
    </ElFormItem>
    <ElFormItem :label="t('administration.common.email')" required :error="errors.email?.[0]">
      <ElInput v-model="model.email" type="email" autocomplete="email" />
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
    <ElFormItem
      :class="showStatus ? '' : 'sm:col-span-2'"
      :label="t('administration.common.roles')"
      required
      :error="errors.role_ids?.[0]"
    >
      <AdminLookupSelect
        v-model="model.roleIds"
        :options="roles"
        multiple
        :loading="rolesLoading"
        :page="lookupMeta.page"
        :per-page="lookupMeta.perPage"
        :total="lookupMeta.total"
        @page="$emit('lookup-page', $event)"
      />
    </ElFormItem>
  </div>
</template>
