<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  status: { type: String, default: '' },
  inepCode: { type: String, default: '' },
  document: { type: String, default: '' },
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  administrativeTypeId: { type: String, default: '' },
  legalNatureId: { type: String, default: '' },
  managementTypeId: { type: String, default: '' },
  pedagogicalApproachId: { type: String, default: '' },
  lookupOptions: {
    type: Object,
    default: () => ({
      administrativeTypes: [],
      legalNatures: [],
      managementTypes: [],
      pedagogicalApproaches: [],
    }),
  },
  lookupStatus: { type: String, default: 'idle' },
})
const emit = defineEmits([
  'update:status',
  'update:inepCode',
  'update:document',
  'update:name',
  'update:email',
  'update:city',
  'update:state',
  'update:administrativeTypeId',
  'update:legalNatureId',
  'update:managementTypeId',
  'update:pedagogicalApproachId',
  'reset',
])
const { t } = useI18n()

const lookupLoading = computed(() => props.lookupStatus === 'loading')
const lookupDisabled = computed(() => props.lookupStatus === 'unavailable')
const institutionalFilters = computed(() => [
  {
    key: 'administrativeTypeId',
    value: props.administrativeTypeId,
    label: t('administration.common.administrativeType'),
    options: props.lookupOptions.administrativeTypes ?? [],
  },
  {
    key: 'legalNatureId',
    value: props.legalNatureId,
    label: t('administration.common.legalNature'),
    options: props.lookupOptions.legalNatures ?? [],
  },
  {
    key: 'managementTypeId',
    value: props.managementTypeId,
    label: t('administration.common.managementType'),
    options: props.lookupOptions.managementTypes ?? [],
  },
  {
    key: 'pedagogicalApproachId',
    value: props.pedagogicalApproachId,
    label: t('administration.common.pedagogicalApproach'),
    options: props.lookupOptions.pedagogicalApproaches ?? [],
  },
])

function optionLabel(option) {
  return option.label ?? option.name ?? option.description ?? String(option.id)
}

function optionValue(option) {
  return String(option.id)
}

function emitUpdate(key, value) {
  emit(`update:${key}`, value ?? '')
}
</script>

<template>
  <ElForm label-position="top" class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
    <ElFormItem :label="t('administration.common.status')" class="!mb-0">
      <ElSelect
        :model-value="status"
        :aria-label="t('administration.common.status')"
        clearable
        data-test="school-filter-status"
        @update:model-value="$emit('update:status', $event ?? '')"
      >
        <ElOption :label="t('administration.common.allStatuses')" value="" />
        <ElOption :label="t('administration.common.active')" value="1" />
        <ElOption :label="t('administration.common.inactive')" value="0" />
      </ElSelect>
    </ElFormItem>

    <ElFormItem :label="t('administration.common.inepCode')" class="!mb-0">
      <ElInput
        :model-value="inepCode"
        clearable
        data-test="school-filter-inep"
        @update:model-value="$emit('update:inepCode', $event)"
      />
    </ElFormItem>

    <ElFormItem :label="t('administration.common.cnpj')" class="!mb-0">
      <ElInput
        :model-value="document"
        clearable
        data-test="school-filter-document"
        @update:model-value="$emit('update:document', $event)"
      />
    </ElFormItem>

    <ElFormItem :label="t('administration.common.name')" class="!mb-0">
      <ElInput
        :model-value="name"
        clearable
        data-test="school-filter-name"
        @update:model-value="$emit('update:name', $event)"
      />
    </ElFormItem>

    <ElFormItem :label="t('administration.common.email')" class="!mb-0">
      <ElInput
        :model-value="email"
        clearable
        data-test="school-filter-email"
        @update:model-value="$emit('update:email', $event)"
      />
    </ElFormItem>

    <ElFormItem :label="t('administration.common.city')" class="!mb-0">
      <ElInput
        :model-value="city"
        clearable
        data-test="school-filter-city"
        @update:model-value="$emit('update:city', $event)"
      />
    </ElFormItem>

    <ElFormItem :label="t('administration.common.state')" class="!mb-0">
      <ElInput
        :model-value="state"
        clearable
        data-test="school-filter-state"
        @update:model-value="$emit('update:state', $event)"
      />
    </ElFormItem>

    <ElFormItem
      v-for="filter in institutionalFilters"
      :key="filter.key"
      :label="filter.label"
      class="!mb-0"
    >
      <ElSelect
        :model-value="filter.value"
        :aria-label="filter.label"
        :loading="lookupLoading"
        :disabled="lookupDisabled"
        clearable
        :data-test="`school-filter-${filter.key}`"
        @update:model-value="emitUpdate(filter.key, $event)"
      >
        <ElOption
          v-for="option in filter.options"
          :key="optionValue(option)"
          :label="optionLabel(option)"
          :value="optionValue(option)"
        />
      </ElSelect>
    </ElFormItem>

    <ElFormItem class="!mb-0 md:col-span-2 xl:col-span-4">
      <ElButton data-test="school-filter-reset" @click="$emit('reset')">
        {{ t('administration.common.resetFilters') }}
      </ElButton>
    </ElFormItem>
  </ElForm>
</template>
