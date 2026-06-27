<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const open = defineModel('open', { type: Boolean, default: false })
const values = defineModel('values', { type: Object, required: true })

const props = defineProps({
  schoolName: { type: String, default: '' },
  pending: { type: Boolean, default: false },
  fieldErrors: { type: Object, default: () => ({}) },
  formError: { type: Object, default: null },
})

const emit = defineEmits(['submit', 'cancel'])
const { t } = useI18n()

const formErrorMessage = computed(() =>
  props.formError?.messageKey ? t(`administration.${props.formError.messageKey}`) : null,
)
</script>

<template>
  <ElDialog
    v-model="open"
    :title="t('administration.common.deleteDialogTitle')"
    width="30rem"
    destroy-on-close
    :close-on-click-modal="false"
    @closed="emit('cancel')"
  >
    <div class="space-y-4">
      <p class="text-sm text-sm-muted">
        {{ t('administration.common.deleteDialogMessage', { name: schoolName }) }}
      </p>

      <ElAlert
        v-if="formErrorMessage && formError?.type !== 'validation'"
        :title="formErrorMessage"
        type="warning"
        :closable="false"
        show-icon
      />

      <ElForm label-position="top" @submit.prevent="emit('submit')">
        <ElFormItem
          :label="t('administration.common.effectiveDate')"
          required
          :error="fieldErrors.effective_at?.[0]"
        >
          <ElDatePicker
            v-model="values.effectiveAt"
            type="date"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </ElFormItem>
        <ElFormItem
          :label="t('administration.common.reason')"
          required
          :error="fieldErrors.reason?.[0]"
        >
          <ElInput
            v-model="values.reason"
            type="textarea"
            :rows="4"
            maxlength="500"
            show-word-limit
          />
        </ElFormItem>
      </ElForm>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <ElButton :disabled="pending" @click="emit('cancel')">
          {{ t('administration.common.cancel') }}
        </ElButton>
        <ElButton type="danger" :loading="pending" @click="emit('submit')">
          {{ t('administration.common.delete') }}
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>
