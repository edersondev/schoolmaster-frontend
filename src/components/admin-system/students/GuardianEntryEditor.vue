<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Delete } from '@element-plus/icons-vue'
import { GUARDIAN_ENTRY_MODES } from '@/contracts/admin-system/student-guardian-tabs'

const props = defineProps({
  entry: { type: Object, required: true },
  fieldErrors: { type: Object, default: () => ({}) },
  lookup: { type: Function, required: true },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['update', 'remove'])
const { t } = useI18n()
const lookupQuery = ref('')
const options = ref([])
const loading = ref(false)
const selectedGuardianId = computed({
  get: () => props.entry.guardianId,
  set: (guardianId) => {
    const selectedGuardian = options.value.find((guardian) => guardian.id === guardianId) ?? null
    emit('update', { guardianId, selectedGuardian })
  },
})

function error(name) {
  return props.fieldErrors[`guardian_associations.${props.entry.index}.${name}`]?.[0]
}

async function searchGuardians(search = '') {
  loading.value = true
  try {
    const result = await props.lookup({ search, perPage: 10 })
    options.value = result.items ?? []
  } finally {
    loading.value = false
  }
}

watch(
  () => props.entry.mode,
  (mode) => {
    if (mode === GUARDIAN_ENTRY_MODES.existing) searchGuardians()
  },
)
</script>

<template>
  <section class="border-t border-sm-border pt-4">
    <div class="mb-4 flex items-center justify-between gap-3">
      <ElSegmented
        :model-value="entry.mode"
        :options="[
          {
            label: t('studentGuardianTabs.guardians.newGuardian'),
            value: GUARDIAN_ENTRY_MODES.new,
          },
          {
            label: t('studentGuardianTabs.guardians.existingGuardian'),
            value: GUARDIAN_ENTRY_MODES.existing,
          },
        ]"
        :disabled="disabled"
        @update:model-value="emit('update', { mode: $event })"
      />
      <ElTooltip :content="t('studentGuardianTabs.guardians.remove')">
        <ElButton
          :icon="Delete"
          circle
          :disabled="disabled"
          :aria-label="t('studentGuardianTabs.guardians.remove')"
          @click="emit('remove')"
        />
      </ElTooltip>
    </div>

    <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
      <ElFormItem
        :label="t('studentGuardianTabs.guardians.relationship')"
        required
        :error="error('relationship_type')"
      >
        <ElInput
          :model-value="entry.relationshipType"
          :disabled="disabled"
          maxlength="80"
          @update:model-value="emit('update', { relationshipType: $event })"
        />
      </ElFormItem>

      <template v-if="entry.mode === GUARDIAN_ENTRY_MODES.existing">
        <ElFormItem
          class="sm:col-span-2"
          :label="t('studentGuardianTabs.guardians.selectExisting')"
          required
          :error="error('guardian_id')"
        >
          <ElSelect
            v-model="selectedGuardianId"
            class="w-full"
            filterable
            remote
            :remote-method="searchGuardians"
            :loading="loading"
            :disabled="disabled"
          >
            <ElOption
              v-for="guardian in options"
              :key="guardian.id"
              :label="guardian.fullName"
              :value="guardian.id"
            />
          </ElSelect>
        </ElFormItem>
      </template>

      <template v-else>
        <ElFormItem
          :label="t('studentGuardianTabs.guardians.fullName')"
          required
          :error="error('full_name')"
        >
          <ElInput
            :model-value="entry.fullName"
            :disabled="disabled"
            maxlength="160"
            autocomplete="name"
            @update:model-value="emit('update', { fullName: $event })"
          />
        </ElFormItem>
        <ElFormItem
          :label="t('studentGuardianTabs.guardians.email')"
          :error="error('contact_email')"
        >
          <ElInput
            :model-value="entry.contactEmail"
            :disabled="disabled"
            type="email"
            autocomplete="email"
            @update:model-value="emit('update', { contactEmail: $event })"
          />
        </ElFormItem>
        <ElFormItem
          :label="t('studentGuardianTabs.guardians.phone')"
          :error="error('contact_phone')"
        >
          <ElInput
            :model-value="entry.contactPhone"
            :disabled="disabled"
            autocomplete="tel"
            @update:model-value="emit('update', { contactPhone: $event })"
          />
        </ElFormItem>
      </template>
    </div>
  </section>
</template>
