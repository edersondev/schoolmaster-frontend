<script setup>
import { useI18n } from 'vue-i18n'
import { PLATFORM_SUPPORT_BLOCKED_CAPABILITIES } from '@/contracts/platform-support/platformSupportContract'

const { t } = useI18n()
const blocked = Object.values(PLATFORM_SUPPORT_BLOCKED_CAPABILITIES)
</script>

<template>
  <section class="rounded border border-slate-200 bg-white p-4">
    <h2 class="text-lg font-semibold text-slate-900">{{ t('platformSupport.diagnostics.blocked') }}</h2>
    <div class="mt-3 flex flex-wrap gap-2">
      <ElTag v-for="item in blocked" :key="item" type="info" effect="plain">{{ item }}</ElTag>
    </div>
  </section>
</template>

