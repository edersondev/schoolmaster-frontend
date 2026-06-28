<script setup>
import { computed, nextTick, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminFeedbackState from './AdminFeedbackState.vue'

const props = defineProps({
  title: { type: String, required: true },
  pending: { type: Boolean, default: false },
  fieldErrors: { type: Object, default: () => ({}) },
  formError: { type: Object, default: null },
  submitLabel: { type: String, default: null },
})
defineEmits(['submit', 'cancel'])
const { t } = useI18n()
const validationSummary = useTemplateRef('validationSummary')
const fieldErrorEntries = computed(() => Object.entries(props.fieldErrors))
const hasValidationFeedback = computed(
  () => fieldErrorEntries.value.length > 0 || props.formError?.type === 'validation',
)
const validationMessageKey = computed(
  () => props.formError?.messageKey ?? 'common.validationSummary',
)
const nonValidationState = computed(() =>
  props.formError?.type && props.formError.type !== 'validation' ? props.formError.type : null,
)

watch(hasValidationFeedback, async (hasFeedback) => {
  if (!hasFeedback) return
  await nextTick()
  validationSummary.value?.focus()
})
</script>

<template>
  <section class="mx-auto flex w-full max-w-3xl flex-col gap-4">
    <h1 class="font-display text-2xl font-semibold text-sm-text">{{ title }}</h1>
    <div
      v-if="hasValidationFeedback"
      ref="validationSummary"
      role="alert"
      tabindex="-1"
      class="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800"
    >
      <p class="font-semibold">{{ t('administration.common.validationSummary') }}</p>
      <p v-if="fieldErrorEntries.length === 0" class="mt-2">
        {{ t(`administration.${validationMessageKey}`) }}
      </p>
      <ul v-else class="mt-2 list-disc pl-5">
        <li v-for="[field, messages] in fieldErrorEntries" :key="field">
          {{ Array.isArray(messages) ? messages.join(' ') : messages }}
        </li>
      </ul>
    </div>
    <AdminFeedbackState
      v-if="nonValidationState"
      :state="nonValidationState"
      :feedback="formError"
      @retry="$emit('submit')"
    />
    <ElForm
      class="rounded-xl border border-sm-border bg-sm-surface p-4 sm:p-6"
      label-position="top"
      @submit.prevent="$emit('submit')"
    >
      <slot />
      <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <ElButton :disabled="pending" @click="$emit('cancel')">{{
          t('administration.common.cancel')
        }}</ElButton>
        <ElButton type="primary" native-type="submit" :loading="pending">
          {{ submitLabel ?? t('administration.common.submit') }}
        </ElButton>
      </div>
    </ElForm>
  </section>
</template>
