<script setup>
import { computed, reactive, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search } from '@element-plus/icons-vue'
import CnpjField from '@/components/ui/CnpjField.vue'
import { normalizeCnpj } from '@/utils/cnpj'

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
const emit = defineEmits(['submit', 'reset'])
const { t } = useI18n()
const draft = reactive(createDraft())
const activePanels = shallowRef([])

const lookupLoading = computed(() => props.lookupStatus === 'loading')
const lookupDisabled = computed(() => props.lookupStatus === 'unavailable')
const inepCode = computed({
  get: () => draft.inepCode,
  set: (value) => {
    draft.inepCode = digitsOnly(value, 8)
  },
})
const state = computed({
  get: () => draft.state,
  set: (value) => {
    draft.state = lettersOnly(value, 4)
  },
})
const institutionalFilters = computed(() => [
  {
    key: 'administrativeTypeId',
    value: draft.administrativeTypeId,
    label: t('administration.common.administrativeType'),
    options: props.lookupOptions.administrativeTypes ?? [],
  },
  {
    key: 'legalNatureId',
    value: draft.legalNatureId,
    label: t('administration.common.legalNature'),
    options: props.lookupOptions.legalNatures ?? [],
  },
  {
    key: 'managementTypeId',
    value: draft.managementTypeId,
    label: t('administration.common.managementType'),
    options: props.lookupOptions.managementTypes ?? [],
  },
  {
    key: 'pedagogicalApproachId',
    value: draft.pedagogicalApproachId,
    label: t('administration.common.pedagogicalApproach'),
    options: props.lookupOptions.pedagogicalApproaches ?? [],
  },
])

watch(
  () => createDraft(),
  (nextDraft) => Object.assign(draft, nextDraft),
  { immediate: true },
)

function createDraft() {
  return {
    status: props.status,
    inepCode: digitsOnly(props.inepCode, 8),
    document: normalizeCnpj(props.document),
    name: props.name,
    email: props.email,
    city: props.city,
    state: lettersOnly(props.state, 4),
    administrativeTypeId: props.administrativeTypeId,
    legalNatureId: props.legalNatureId,
    managementTypeId: props.managementTypeId,
    pedagogicalApproachId: props.pedagogicalApproachId,
  }
}

function optionLabel(option) {
  return option.label ?? option.name ?? option.description ?? String(option.id)
}

function optionValue(option) {
  return String(option.id)
}

function updateDraft(key, value) {
  draft[key] = value ?? ''
}

function digitsOnly(value, maxLength) {
  return String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, maxLength)
}

function lettersOnly(value, maxLength) {
  return String(value ?? '')
    .replace(/[^A-Za-z]/g, '')
    .slice(0, maxLength)
}

function submitFilters() {
  emit('submit', { ...draft, document: normalizeCnpj(draft.document) })
}
</script>

<template>
  <ElCollapse v-model="activePanels">
    <ElCollapseItem name="search">
      <template #title>
        <span class="inline-flex items-center gap-2 font-medium">
          <span>{{ t('administration.common.search') }}</span>
          <ElIcon><Search /></ElIcon>
        </span>
      </template>

      <ElForm
        label-position="top"
        class="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
        @submit.prevent="submitFilters"
      >
        <ElFormItem :label="t('administration.common.status')" class="!mb-0">
          <ElSelect
            v-model="draft.status"
            :aria-label="t('administration.common.status')"
            clearable
            data-test="school-filter-status"
          >
            <ElOption :label="t('administration.common.allStatuses')" value="" />
            <ElOption :label="t('administration.common.active')" value="1" />
            <ElOption :label="t('administration.common.inactive')" value="0" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem :label="t('administration.common.inepCode')" class="!mb-0">
          <ElInput
            v-model="inepCode"
            clearable
            inputmode="numeric"
            maxlength="8"
            data-test="school-filter-inep"
          />
        </ElFormItem>

        <ElFormItem :label="t('administration.common.cnpj')" class="!mb-0">
          <CnpjField v-model="draft.document" data-test="school-filter-document" />
        </ElFormItem>

        <ElFormItem :label="t('administration.common.name')" class="!mb-0">
          <ElInput v-model="draft.name" clearable maxlength="255" data-test="school-filter-name" />
        </ElFormItem>

        <ElFormItem :label="t('administration.common.email')" class="!mb-0">
          <ElInput
            v-model="draft.email"
            clearable
            type="email"
            maxlength="100"
            data-test="school-filter-email"
          />
        </ElFormItem>

        <ElFormItem :label="t('administration.common.city')" class="!mb-0">
          <ElInput v-model="draft.city" clearable maxlength="255" data-test="school-filter-city" />
        </ElFormItem>

        <ElFormItem :label="t('administration.common.state')" class="!mb-0">
          <ElInput v-model="state" clearable maxlength="4" data-test="school-filter-state" />
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
            @update:model-value="updateDraft(filter.key, $event)"
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
          <div class="ml-auto flex flex-wrap justify-end gap-2">
            <ElButton native-type="button" data-test="school-filter-reset" @click="$emit('reset')">
              {{ t('administration.common.resetFilters') }}
            </ElButton>
            <ElButton type="primary" native-type="submit" data-test="school-filter-submit">
              {{ t('administration.common.search') }}
            </ElButton>
          </div>
        </ElFormItem>
      </ElForm>
    </ElCollapseItem>
  </ElCollapse>
</template>
