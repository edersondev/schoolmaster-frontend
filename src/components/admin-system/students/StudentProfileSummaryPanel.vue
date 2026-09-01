<script setup>
import { useI18n } from 'vue-i18n'
import { formatPhone } from '@/utils/phone'

defineProps({
  student: { type: Object, default: null },
})
const { t } = useI18n()
</script>

<template>
  <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <div>
      <dt class="text-xs font-medium uppercase text-sm-muted">
        {{ t('studentEnrollmentRoster.students.registrationNumber') }}
      </dt>
      <dd class="text-sm-text">{{ student?.registrationNumber || '—' }}</dd>
    </div>
    <div>
      <dt class="text-xs font-medium uppercase text-sm-muted">
        {{ t('studentEnrollmentRoster.students.enrolledAt') }}
      </dt>
      <dd class="text-sm-text">{{ student?.enrolledAt || '—' }}</dd>
    </div>
    <div>
      <dt class="text-xs font-medium uppercase text-sm-muted">
        {{ t('studentEnrollmentRoster.students.statusEffectiveAt') }}
      </dt>
      <dd class="text-sm-text">{{ student?.statusEffectiveAt || '—' }}</dd>
    </div>
    <div>
      <dt class="text-xs font-medium uppercase text-sm-muted">
        {{ t('studentEnrollmentRoster.students.eligibility') }}
      </dt>
      <dd class="text-sm-text">
        {{
          student?.activeEligible
            ? t('administration.common.active')
            : t('studentEnrollmentRoster.feedback.historicalOnly')
        }}
      </dd>
    </div>
    <div>
      <dt class="text-xs font-medium uppercase text-sm-muted">
        {{ t('studentEnrollmentRoster.students.dateOfBirth') }}
      </dt>
      <dd class="text-sm-text">{{ student?.dateOfBirth || '—' }}</dd>
    </div>
    <div>
      <dt class="text-xs font-medium uppercase text-sm-muted">
        {{ t('studentEnrollmentRoster.students.contactEmail') }}
      </dt>
      <dd class="break-words text-sm-text">{{ student?.contactEmail || '—' }}</dd>
    </div>
    <div>
      <dt class="text-xs font-medium uppercase text-sm-muted">
        {{ t('studentEnrollmentRoster.students.contactPhone') }}
      </dt>
      <dd class="text-sm-text">{{ formatPhone(student?.contactPhone) || '—' }}</dd>
    </div>
  </dl>
</template>
