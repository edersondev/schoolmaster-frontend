<script setup>
import { reactive, shallowRef, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  academicPeriodId: { type: String, default: '' },
  periods: { type: Array, default: () => [] },
  periodsLoading: { type: Boolean, default: false },
  blocked: { type: Boolean, default: false },
  status: { type: String, default: '' },
})
const emit = defineEmits(['submit', 'reset', 'retry'])
const { t } = useI18n()
const draft = reactive(createDraft())
const activePanels = shallowRef([])

watch(
  () => createDraft(),
  (nextDraft) => Object.assign(draft, nextDraft),
  { immediate: true },
)

function createDraft() {
  return {
    academicPeriodId: props.academicPeriodId,
    status: props.status,
  }
}

function submitFilters() {
  emit('submit', { ...draft })
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
        class="grid gap-3 md:grid-cols-2"
        @submit.prevent="submitFilters"
      >
        <ElFormItem label="Academic period" class="!mb-0">
          <ElSelect
            v-model="draft.academicPeriodId"
            class="w-full"
            :loading="periodsLoading"
            :disabled="periodsLoading || periods.length === 0"
            placeholder="Select academic period"
            data-test="class-section-filter-academic-period"
          >
            <ElOption
              v-for="period in periods"
              :key="period.academicPeriodId"
              :label="period.label"
              :value="period.academicPeriodId"
            />
          </ElSelect>
        </ElFormItem>

        <ElFormItem :label="t('administration.common.status')" class="!mb-0">
          <ElSelect
            v-model="draft.status"
            class="w-full"
            :aria-label="t('administration.common.status')"
            clearable
            data-test="class-section-filter-status"
          >
            <ElOption :label="t('administration.common.allStatuses')" value="" />
            <ElOption :label="t('administration.common.active')" value="active" />
            <ElOption :label="t('administration.common.inactive')" value="inactive" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem class="!mb-0 md:col-span-2">
          <div class="ml-auto flex flex-wrap justify-end gap-2">
            <ElButton
              native-type="button"
              data-test="class-section-filter-reset"
              @click="emit('reset')"
            >
              {{ t('administration.common.resetFilters') }}
            </ElButton>
            <ElButton type="primary" native-type="submit" data-test="class-section-filter-submit">
              {{ t('administration.common.search') }}
            </ElButton>
          </div>
        </ElFormItem>

        <div v-if="blocked" class="flex items-center gap-2 md:col-span-2">
          <ElTag type="warning" effect="light">No current period</ElTag>
          <ElButton @click="emit('retry')">Reload</ElButton>
        </div>
      </ElForm>
    </ElCollapseItem>
  </ElCollapse>
</template>
