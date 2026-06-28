<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminStatusTag from '@/components/ui/admin/AdminStatusTag.vue'

const props = defineProps({ record: { type: Object, required: true } })
const { t } = useI18n()
const permissionCodes = computed(() => props.record.permissions?.map((permission) => permission.code).join(', ') || '—')
</script>

<template>
  <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <div><dt class="text-xs font-medium uppercase text-sm-muted">{{ t('administration.common.name') }}</dt><dd class="text-sm-text">{{ record.name }}</dd></div>
    <div><dt class="text-xs font-medium uppercase text-sm-muted">{{ t('administration.common.scope') }}</dt><dd class="text-sm-text">{{ record.scope || 'school' }}</dd></div>
    <div><dt class="text-xs font-medium uppercase text-sm-muted">{{ t('administration.common.status') }}</dt><dd><AdminStatusTag :status="record.status" compact /></dd></div>
    <div class="sm:col-span-2"><dt class="text-xs font-medium uppercase text-sm-muted">{{ t('administration.common.permissions') }}</dt><dd class="text-sm-text">{{ permissionCodes }}</dd></div>
  </dl>
</template>
