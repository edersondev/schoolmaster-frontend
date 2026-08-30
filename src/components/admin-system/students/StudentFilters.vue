<script setup>
import { reactive, shallowRef, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  search: { type: String, default: '' },
  status: { type: String, default: '' },
})
const emit = defineEmits(['submit', 'reset'])
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
    search: props.search,
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
        <ElFormItem :label="t('studentEnrollmentRoster.students.searchLabel')" class="!mb-0">
          <ElInput
            v-model="draft.search"
            clearable
            maxlength="120"
            data-test="student-filter-search"
          />
        </ElFormItem>

        <ElFormItem :label="t('administration.common.status')" class="!mb-0">
          <ElSelect
            v-model="draft.status"
            :aria-label="t('administration.common.status')"
            clearable
            data-test="student-filter-status"
          >
            <ElOption :label="t('administration.common.allStatuses')" value="" />
            <ElOption :label="t('administration.common.active')" value="active" />
            <ElOption :label="t('administration.common.inactive')" value="inactive" />
            <ElOption
              :label="t('studentEnrollmentRoster.students.transferred')"
              value="transferred"
            />
          </ElSelect>
        </ElFormItem>

        <ElFormItem class="!mb-0 md:col-span-2">
          <div class="ml-auto flex flex-wrap justify-end gap-2">
            <ElButton native-type="button" data-test="student-filter-reset" @click="$emit('reset')">
              {{ t('administration.common.resetFilters') }}
            </ElButton>
            <ElButton type="primary" native-type="submit" data-test="student-filter-submit">
              {{ t('administration.common.search') }}
            </ElButton>
          </div>
        </ElFormItem>
      </ElForm>
    </ElCollapseItem>
  </ElCollapse>
</template>
