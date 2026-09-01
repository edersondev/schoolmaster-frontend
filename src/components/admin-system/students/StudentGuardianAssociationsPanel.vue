<script setup>
import { useI18n } from 'vue-i18n'
import AdminStatusTag from '@/components/ui/admin/AdminStatusTag.vue'
import { formatPhone } from '@/utils/phone'

defineProps({
  associations: { type: Array, default: () => [] },
})
const { t } = useI18n()
</script>

<template>
  <div class="space-y-4">
    <p v-if="associations.length === 0" class="text-sm text-sm-muted">
      {{ t('studentGuardianTabs.guardians.empty') }}
    </p>

    <article
      v-for="association in associations"
      :key="association.id ?? association.guardianId ?? association.fullName"
      class="rounded-lg border border-sm-border bg-sm-surface p-4"
    >
      <div class="mb-3 flex flex-wrap items-center gap-2">
        <h2 class="font-display text-lg font-semibold text-sm-text">
          {{ association.fullName }}
        </h2>
        <AdminStatusTag :status="association.status" compact />
      </div>
      <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt class="text-xs font-medium uppercase text-sm-muted">
            {{ t('studentGuardianTabs.guardians.relationship') }}
          </dt>
          <dd class="text-sm-text">{{ association.relationshipType || '—' }}</dd>
        </div>
        <div>
          <dt class="text-xs font-medium uppercase text-sm-muted">
            {{ t('studentGuardianTabs.guardians.email') }}
          </dt>
          <dd class="break-words text-sm-text">{{ association.contactEmail || '—' }}</dd>
        </div>
        <div>
          <dt class="text-xs font-medium uppercase text-sm-muted">
            {{ t('studentGuardianTabs.guardians.phone') }}
          </dt>
          <dd class="text-sm-text">{{ formatPhone(association.contactPhone) || '—' }}</dd>
        </div>
      </dl>
    </article>
  </div>
</template>
