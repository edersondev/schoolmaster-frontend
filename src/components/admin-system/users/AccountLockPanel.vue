<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  lock: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  hidden: { type: Boolean, default: false },
})

const { t } = useI18n()
</script>

<template>
  <section v-if="!hidden" class="grid gap-4 border-t border-sm-border pt-6">
    <header>
      <h3 class="text-base font-semibold text-sm-ink">
        {{ t('accountLifecycle.lock.title') }}
      </h3>
    </header>
    <ElSkeleton v-if="loading" :rows="3" animated />
    <p v-else-if="!lock || lock.status === 'none'" class="text-sm text-sm-muted">
      {{ t('accountLifecycle.lock.empty') }}
    </p>
    <dl v-else class="grid gap-2 text-sm text-sm-muted sm:grid-cols-2">
      <div>
        <dt class="font-medium text-sm-ink">{{ t('accountLifecycle.lock.status') }}</dt>
        <dd>{{ lock.status }}</dd>
      </div>
      <div>
        <dt class="font-medium text-sm-ink">{{ t('accountLifecycle.lock.type') }}</dt>
        <dd>{{ lock.lockType ?? '-' }}</dd>
      </div>
      <div>
        <dt class="font-medium text-sm-ink">{{ t('accountLifecycle.lock.lockedAt') }}</dt>
        <dd>{{ lock.lockedAt ?? '-' }}</dd>
      </div>
      <div>
        <dt class="font-medium text-sm-ink">{{ t('accountLifecycle.lock.clearedAt') }}</dt>
        <dd>{{ lock.clearedAt ?? '-' }}</dd>
      </div>
      <div class="sm:col-span-2">
        <dt class="font-medium text-sm-ink">{{ t('accountLifecycle.lock.reason') }}</dt>
        <dd>{{ lock.reason ?? '-' }}</dd>
      </div>
    </dl>
  </section>
</template>

