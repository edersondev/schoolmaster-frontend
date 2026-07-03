<script setup>
import { useI18n } from 'vue-i18n'
import PlatformSupportStatusBadges from './PlatformSupportStatusBadges.vue'

defineProps({
  diagnostics: { type: Object, default: null },
})
const { t } = useI18n()
</script>

<template>
  <section class="space-y-4 rounded border border-slate-200 bg-white p-4">
    <h2 class="text-lg font-semibold text-slate-900">{{ t('platformSupport.diagnostics.groups') }}</h2>
    <PlatformSupportStatusBadges :redacted-fields="diagnostics?.redactedFields" :suppressed="diagnostics?.suppressed" />
    <div class="grid gap-3 md:grid-cols-2">
      <article v-for="group in diagnostics?.groups" :key="group.key" class="rounded border border-slate-200 p-3">
        <h3 class="font-medium text-slate-900">{{ group.key }}</h3>
        <p class="text-sm text-slate-600">{{ group.state }}</p>
      </article>
    </div>
  </section>
</template>

