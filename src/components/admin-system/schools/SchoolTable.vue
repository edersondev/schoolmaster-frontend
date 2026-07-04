<script setup>
import { useI18n } from 'vue-i18n'
import AdminRowActions from '@/components/ui/admin/AdminRowActions.vue'
import AdminStatusTag from '@/components/ui/admin/AdminStatusTag.vue'
import { formatCnpj } from '@/utils/cnpj'

defineProps({
  rows: { type: Array, default: () => [] },
  canManage: { type: Boolean, default: false },
  actionResolver: { type: Function, default: () => [] },
})
const emit = defineEmits(['view', 'edit', 'lifecycle'])
const { t } = useI18n()
</script>

<template>
  <ElTable :data="rows" class="w-full" table-layout="auto">
    <ElTableColumn
      prop="name"
      :label="t('administration.common.name')"
      :min-width="220"
    >
      <template #default="{ row }">
        <button class="font-medium text-sm-brand hover:underline" type="button" @click="emit('view', row)">
          {{ row.name ?? '—' }}
        </button>
      </template>
    </ElTableColumn>
    <ElTableColumn prop="cnpj" :label="t('administration.common.cnpj')" :min-width="170">
      <template #default="{ row }">
        <span class="text-sm-muted">{{ formatCnpj(row.cnpj) || '—' }}</span>
      </template>
    </ElTableColumn>
    <ElTableColumn prop="status" :label="t('administration.common.status')">
      <template #default="{ row }">
        <AdminStatusTag :status="row.status" compact />
      </template>
    </ElTableColumn>
    <ElTableColumn
      prop="contactEmail"
      :label="t('administration.common.email')"
      :min-width="220"
    >
      <template #default="{ row }">
        <span class="text-sm-muted">{{ row.contactEmail ?? '—' }}</span>
      </template>
    </ElTableColumn>
    <ElTableColumn
      v-if="canManage"
      :label="t('administration.common.actions')"
      :min-width="180"
    >
      <template #default="{ row }">
        <div class="flex items-center gap-2">
          <ElButton
            link
            type="primary"
            data-test="edit-school"
            @click="emit('edit', row)"
          >
            {{ t('administration.common.edit') }}
          </ElButton>
          <AdminRowActions :actions="actionResolver(row)" @action="emit('lifecycle', { row, action: $event })" />
        </div>
      </template>
    </ElTableColumn>
  </ElTable>
</template>
