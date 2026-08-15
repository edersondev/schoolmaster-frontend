<script setup>
import { reactive, shallowRef, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  name: { type: String, default: '' },
  dateFrom: { type: String, default: '' },
  dateTo: { type: String, default: '' },
  status: { type: String, default: '' },
})
const emit = defineEmits(['submit', 'reset'])
const { t } = useI18n()
const activePanels = shallowRef([])
const draft = reactive(createDraft())

watch(
  () => createDraft(),
  (nextDraft) => Object.assign(draft, nextDraft),
  { immediate: true },
)

function createDraft() {
  return {
    name: props.name,
    dateRange: props.dateFrom && props.dateTo ? [props.dateFrom, props.dateTo] : [],
    status: props.status,
  }
}

function submitFilters() {
  emit('submit', {
    name: draft.name.trim(),
    dateFrom: draft.dateRange?.[0] ?? '',
    dateTo: draft.dateRange?.[1] ?? '',
    status: draft.status,
  })
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
        class="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
        @submit.prevent="submitFilters"
      >
        <ElFormItem
          :label="t('administration.common.name')"
          class="!mb-0"
          data-test="academic-year-filter-name"
        >
          <ElInput v-model="draft.name" clearable maxlength="255" />
        </ElFormItem>

        <ElFormItem
          :label="t('administration.academicYears.dateRange')"
          class="!mb-0"
          data-test="academic-year-filter-date-range"
        >
          <ElDatePicker
            v-model="draft.dateRange"
            type="daterange"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :range-separator="t('administration.academicYears.dateRangeSeparator')"
            :start-placeholder="t('administration.common.startDate')"
            :end-placeholder="t('administration.common.endDate')"
            class="!w-full"
            clearable
          />
        </ElFormItem>

        <ElFormItem
          :label="t('administration.common.status')"
          class="!mb-0"
          data-test="academic-year-filter-status"
        >
          <ElSelect v-model="draft.status" clearable>
            <ElOption :label="t('administration.common.allStatuses')" value="" />
            <ElOption :label="t('administration.common.planned')" value="planned" />
            <ElOption :label="t('administration.common.active')" value="active" />
            <ElOption :label="t('administration.common.closed')" value="closed" />
            <ElOption :label="t('administration.common.inactive')" value="inactive" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem class="!mb-0 md:col-span-2 xl:col-span-3">
          <div class="ml-auto flex flex-wrap justify-end gap-2">
            <ElButton
              native-type="button"
              data-test="academic-year-filter-reset"
              @click="$emit('reset')"
            >
              {{ t('administration.common.resetFilters') }}
            </ElButton>
            <ElButton type="primary" native-type="submit" data-test="academic-year-filter-submit">
              {{ t('administration.common.search') }}
            </ElButton>
          </div>
        </ElFormItem>
      </ElForm>
    </ElCollapseItem>
  </ElCollapse>
</template>
