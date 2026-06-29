<script setup>
import { useI18n } from 'vue-i18n'
import AdminStatusTag from '@/components/ui/admin/AdminStatusTag.vue'

defineProps({ record: { type: Object, required: true } })
const { t } = useI18n()
</script>

<template>
  <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <div><dt class="text-xs font-medium uppercase text-sm-muted">{{ t('administration.common.fullName') }}</dt><dd class="text-sm-text">{{ record.fullName }}</dd></div>
    <div><dt class="text-xs font-medium uppercase text-sm-muted">{{ t('administration.common.relationship') }}</dt><dd class="text-sm-text">{{ record.relationshipType }}</dd></div>
    <div><dt class="text-xs font-medium uppercase text-sm-muted">{{ t('administration.common.status') }}</dt><dd><AdminStatusTag :status="record.status" compact /></dd></div>
    <div><dt class="text-xs font-medium uppercase text-sm-muted">{{ t('administration.common.email') }}</dt><dd class="text-sm-text">{{ record.contactEmail || '—' }}</dd></div>
    <div><dt class="text-xs font-medium uppercase text-sm-muted">{{ t('administration.common.phone') }}</dt><dd class="text-sm-text">{{ record.contactPhone || '—' }}</dd></div>
  </dl>
</template>
