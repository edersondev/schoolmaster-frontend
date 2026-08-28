<script setup>
import { reactive, shallowRef, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  fullName: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
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
    fullName: props.fullName,
    contactEmail: props.contactEmail,
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
        class="grid gap-3 md:grid-cols-3"
        @submit.prevent="submitFilters"
      >
        <ElFormItem :label="t('administration.common.fullName')" class="!mb-0">
          <ElInput
            v-model="draft.fullName"
            clearable
            maxlength="255"
            data-test="guardian-filter-full-name"
          />
        </ElFormItem>

        <ElFormItem :label="t('administration.common.email')" class="!mb-0">
          <ElInput
            v-model="draft.contactEmail"
            clearable
            inputmode="email"
            maxlength="255"
            data-test="guardian-filter-contact-email"
          />
        </ElFormItem>

        <ElFormItem :label="t('administration.common.status')" class="!mb-0">
          <ElSelect
            v-model="draft.status"
            :aria-label="t('administration.common.status')"
            clearable
            data-test="guardian-filter-status"
          >
            <ElOption :label="t('administration.common.allStatuses')" value="" />
            <ElOption :label="t('administration.common.active')" value="active" />
            <ElOption :label="t('administration.common.inactive')" value="inactive" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem class="!mb-0 md:col-span-3">
          <div class="ml-auto flex flex-wrap justify-end gap-2">
            <ElButton
              native-type="button"
              data-test="guardian-filter-reset"
              @click="$emit('reset')"
            >
              {{ t('administration.common.resetFilters') }}
            </ElButton>
            <ElButton type="primary" native-type="submit" data-test="guardian-filter-submit">
              {{ t('administration.common.search') }}
            </ElButton>
          </div>
        </ElFormItem>
      </ElForm>
    </ElCollapseItem>
  </ElCollapse>
</template>
