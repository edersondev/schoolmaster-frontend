<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const open = defineModel('open', { type: Boolean, default: false })
const emit = defineEmits(['closed'])
const props = defineProps({
  role: { type: Object, default: null },
})
const { t } = useI18n()
const permissions = computed(() =>
  Array.isArray(props.role?.permissions) ? props.role.permissions : [],
)
const title = computed(() =>
  t('administration.roles.permissionsDialogTitle', { role: props.role?.name ?? '' }),
)
</script>

<template>
  <ElDialog
    v-model="open"
    :title="title"
    width="min(92vw, 720px)"
    destroy-on-close
    @closed="emit('closed')"
  >
    <ElTable
      :data="permissions"
      :empty-text="t('administration.roles.noPermissions')"
      table-layout="auto"
      class="w-full"
    >
      <ElTableColumn
        prop="code"
        :label="t('administration.roles.permissionName')"
        min-width="220"
        show-overflow-tooltip
      />
      <ElTableColumn
        prop="name"
        :label="t('administration.common.description')"
        min-width="260"
        show-overflow-tooltip
      />
    </ElTable>

    <template #footer>
      <ElButton @click="open = false">{{ t('administration.common.close') }}</ElButton>
    </template>
  </ElDialog>
</template>
