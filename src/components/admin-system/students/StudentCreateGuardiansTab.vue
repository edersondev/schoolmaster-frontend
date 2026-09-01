<script setup>
import { useI18n } from 'vue-i18n'
import { Plus } from '@element-plus/icons-vue'
import GuardianEntryEditor from './GuardianEntryEditor.vue'

defineProps({
  entries: { type: Array, default: () => [] },
  fieldErrors: { type: Object, default: () => ({}) },
  canManage: { type: Boolean, default: false },
  canAdd: { type: Boolean, default: false },
  maximumReached: { type: Boolean, default: false },
  pending: { type: Boolean, default: false },
  lookup: { type: Function, required: true },
})
const emit = defineEmits(['add', 'remove', 'update'])
const { t } = useI18n()
</script>

<template>
  <div class="space-y-4">
    <ElAlert
      v-if="!canManage"
      type="info"
      :closable="false"
      :title="t('studentGuardianTabs.guardians.permissionRequired')"
    />
    <ElAlert
      v-else-if="maximumReached"
      type="info"
      :closable="false"
      :title="t('studentGuardianTabs.guardians.maximumTwo')"
    />

    <div class="flex justify-end">
      <ElButton
        type="primary"
        plain
        :icon="Plus"
        :disabled="!canAdd || pending"
        @click="emit('add')"
      >
        {{ t('studentGuardianTabs.guardians.add') }}
      </ElButton>
    </div>

    <p v-if="entries.length === 0" class="text-sm text-sm-muted">
      {{ t('studentGuardianTabs.guardians.empty') }}
    </p>

    <GuardianEntryEditor
      v-for="(entry, index) in entries"
      :key="entry.entryId"
      :entry="{ ...entry, index }"
      :field-errors="fieldErrors"
      :lookup="lookup"
      :disabled="pending || !canManage"
      @update="emit('update', entry.entryId, $event)"
      @remove="emit('remove', entry.entryId)"
    />
  </div>
</template>
