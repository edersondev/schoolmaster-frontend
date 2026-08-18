<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import RolePermissionsGrid from '@/components/admin-system/roles/RolePermissionsGrid.vue'

const open = defineModel('open', { type: Boolean, default: false })
const emit = defineEmits(['closed'])
const props = defineProps({
  role: { type: Object, default: null },
})
const { t } = useI18n()
const title = computed(() =>
  t('administration.roles.permissionsDialogTitle', { role: props.role?.name ?? '' }),
)
</script>

<template>
  <ElDialog
    v-model="open"
    :title="title"
    width="min(92vw, 1120px)"
    destroy-on-close
    @closed="emit('closed')"
  >
    <RolePermissionsGrid :permissions="role?.permissions" />

    <template #footer>
      <ElButton @click="open = false">{{ t('administration.common.close') }}</ElButton>
    </template>
  </ElDialog>
</template>
