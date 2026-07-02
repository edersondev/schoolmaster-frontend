<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  contact: { type: Object, default: null },
  relationshipLabel: { type: String, default: '' },
})

const { t } = useI18n()
</script>

<template>
  <section class="rounded-lg border border-slate-200 bg-white p-4" aria-labelledby="guardian-contact-title">
    <h3 id="guardian-contact-title" class="text-base font-semibold text-slate-950">
      {{ t('guardianSelfService.contacts.guardianContact') }}
    </h3>
    <p class="mt-1 text-sm text-slate-600">
      {{ t('guardianSelfService.labels.relationship') }}:
      {{ relationshipLabel || t('guardianSelfService.labels.unavailable') }}
    </p>
    <dl class="mt-4 grid gap-3">
      <div>
        <dt class="text-sm font-medium text-slate-600">{{ t('guardianSelfService.labels.name') }}</dt>
        <dd>{{ contact?.name || t('guardianSelfService.labels.missingValue') }}</dd>
      </div>
      <div>
        <dt class="text-sm font-medium text-slate-600">{{ t('guardianSelfService.labels.email') }}</dt>
        <dd>{{ contact?.email || t('guardianSelfService.labels.missingValue') }}</dd>
      </div>
      <div>
        <dt class="text-sm font-medium text-slate-600">{{ t('guardianSelfService.labels.phone') }}</dt>
        <dd>{{ contact?.phone || t('guardianSelfService.labels.missingValue') }}</dd>
      </div>
    </dl>
  </section>
</template>
