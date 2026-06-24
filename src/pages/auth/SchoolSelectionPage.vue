<script setup>
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import SchoolSelectionList from '@/components/auth/SchoolSelectionList.vue'

const { t } = useI18n()
const store = useAuthSessionStore()
const { authorizedSchools, schoolSelectionSourceApproved } = storeToRefs(store)
</script>

<template>
  <article
    class="grid gap-[1.35rem] rounded-[1.25rem] border border-sm-brand/15 bg-white/85 p-[clamp(1.5rem,4vw,2.5rem)] shadow-[0_1.5rem_4rem_rgba(30,41,59,0.1)]"
  >
    <header>
      <h2 class="font-display text-4xl font-medium">
        {{ t('auth.schoolSelection.title') }}
      </h2>
      <p class="mt-[0.55rem] leading-[1.6] text-sm-muted">
        {{ t('auth.schoolSelection.subtitle') }}
      </p>
    </header>

    <ElAlert
      v-if="!schoolSelectionSourceApproved"
      :title="t('auth.schoolSelection.blockedTitle')"
      :description="t('auth.schoolSelection.blockedMessage')"
      type="warning"
      :closable="false"
      show-icon
    />

    <SchoolSelectionList v-else :schools="authorizedSchools" />
  </article>
</template>
