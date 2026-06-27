<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Loading } from '@element-plus/icons-vue'
import { AUTH_ROUTE_NAMES } from '@/router/modules/auth.routes'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'

const props = defineProps({
  state: { type: String, required: true },
  feedback: { type: Object, default: null },
})
const emit = defineEmits(['retry', 'reset'])
const { t } = useI18n()
const sessionStore = useAuthSessionStore()

const messageKey = computed(
  () =>
    props.feedback?.messageKey ??
    {
      loading: 'common.loading',
      empty: 'common.empty',
      'filtered-empty': 'common.filteredEmpty',
      forbidden: 'common.forbidden',
      conflict: 'common.conflict',
      'tenant-mismatch': 'common.tenantMismatch',
      'inactive-context': 'common.inactiveContext',
      'not-found': 'common.notFound',
      unavailable: 'common.unavailable',
      unauthorized: 'common.sessionExpired',
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
    <RouterLink
      v-if="state === 'unauthorized'"
      class="inline-flex min-h-8 items-center justify-center rounded border border-sm-brand bg-sm-brand px-4 py-2 text-sm font-medium text-white no-underline"
      :to="{ name: AUTH_ROUTE_NAMES.login }"
      @click="sessionStore.markSessionExpired"
    >
      {{ t('administration.common.signIn') }}
    </RouterLink>
    <ElButton v-if="state === 'filtered-empty'" @click="emit('reset')">
      {{ t('administration.common.resetFilters') }}
    </ElButton>
  </section>
</template>
