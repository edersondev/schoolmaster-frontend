<script setup>
import { useI18n } from 'vue-i18n'
import AdminStatusTag from '@/components/ui/admin/AdminStatusTag.vue'

defineProps({ record: { type: Object, required: true } })
const { t } = useI18n()
</script>

<template>
  <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <div><dt class="text-xs font-medium uppercase text-sm-muted">{{ t('administration.common.name') }}</dt><dd class="text-sm-text">{{ record.name }}</dd></div>
    <div><dt class="text-xs font-medium uppercase text-sm-muted">{{ t('administration.common.status') }}</dt><dd><AdminStatusTag :status="record.status" compact /></dd></div>
    <div><dt class="text-xs font-medium uppercase text-sm-muted">{{ t('administration.common.startDate') }}</dt><dd class="text-sm-text">{{ record.startDate }}</dd></div>
    <div><dt class="text-xs font-medium uppercase text-sm-muted">{{ t('administration.common.endDate') }}</dt><dd class="text-sm-text">{{ record.endDate }}</dd></div>
  </dl>
</template>
