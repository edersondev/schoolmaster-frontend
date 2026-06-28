<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminStatusTag from '@/components/ui/admin/AdminStatusTag.vue'

const props = defineProps({ record: { type: Object, required: true } })
const { t } = useI18n()
const roleNames = computed(() => props.record.roles?.map((role) => role.name).join(', ') || '—')
</script>

<template>
  <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <div><dt class="text-xs font-medium uppercase text-sm-muted">{{ t('administration.common.fullName') }}</dt><dd class="text-sm-text">{{ record.fullName }}</dd></div>
    <div><dt class="text-xs font-medium uppercase text-sm-muted">{{ t('administration.common.email') }}</dt><dd class="text-sm-text">{{ record.email }}</dd></div>
    <div><dt class="text-xs font-medium uppercase text-sm-muted">{{ t('administration.common.status') }}</dt><dd><AdminStatusTag :status="record.status" compact /></dd></div>
    <div><dt class="text-xs font-medium uppercase text-sm-muted">{{ t('administration.common.roles') }}</dt><dd class="text-sm-text">{{ roleNames }}</dd></div>
  </dl>
</template>
