<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Loading } from '@element-plus/icons-vue'

const props = defineProps({
  state: { type: String, required: true },
  feedback: { type: Object, default: null },
})
const emit = defineEmits(['retry', 'reset'])
const { t } = useI18n()

const messageKey = computed(
  () =>
    props.feedback?.messageKey ??
    {
      loading: 'common.loading',
      empty: 'common.empty',
      'filtered-empty': 'common.filteredEmpty',
      forbidden: 'common.forbidden',
      'tenant-mismatch': 'common.tenantMismatch',
      'inactive-context': 'common.inactiveContext',
      'not-found': 'common.notFound',
      unavailable: 'common.unavailable',
    }[props.state] ??
    'common.unknownError',
)
</script>

<template>
  <section
    class="flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border border-sm-border bg-sm-surface p-6 text-center"
    :aria-live="state === 'loading' ? 'polite' : 'assertive'"
  >
    <ElIcon v-if="state === 'loading'" class="is-loading text-2xl text-sm-brand">
      <Loading />
    </ElIcon>
    <ElEmpty
      v-else-if="state === 'empty' || state === 'filtered-empty'"
      :description="t(`administration.${messageKey}`)"
    />
    <ElAlert
      v-else
      :title="t(`administration.${messageKey}`)"
      type="warning"
      :closable="false"
      show-icon
    />
    <div v-if="state === 'unavailable' || state === 'unknown'" class="flex gap-2">
      <ElButton type="primary" @click="emit('retry')">{{
        t('administration.common.retry')
      }}</ElButton>
    </div>
    <ElButton v-if="state === 'filtered-empty'" @click="emit('reset')">
      {{ t('administration.common.resetFilters') }}
    </ElButton>
  </section>
</template>
