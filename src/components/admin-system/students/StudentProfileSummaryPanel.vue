<script setup>
import AdminLifecycleStatusTag from '@/components/admin-system/shared/AdminLifecycleStatusTag.vue'

defineProps({
  student: { type: Object, default: null },
})
</script>

<template>
  <section class="rounded-lg border border-sm-border bg-sm-surface p-5">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="text-lg font-semibold text-sm-text">{{ student?.fullName || 'Student' }}</h2>
        <p class="text-sm text-sm-muted">{{ student?.registrationNumber || 'No registration number' }}</p>
      </div>
      <AdminLifecycleStatusTag :status="student?.status" />
    </div>
    <dl class="mt-5 grid gap-4 text-sm md:grid-cols-3">
      <div>
        <dt class="text-sm-muted">Enrollment</dt>
        <dd class="font-medium text-sm-text">{{ student?.enrolledAt || '—' }}</dd>
      </div>
      <div>
        <dt class="text-sm-muted">Effective</dt>
        <dd class="font-medium text-sm-text">{{ student?.statusEffectiveAt || '—' }}</dd>
      </div>
      <div>
        <dt class="text-sm-muted">Eligibility</dt>
        <dd class="font-medium text-sm-text">{{ student?.activeEligible ? 'Active' : 'Historical only' }}</dd>
      </div>
    </dl>
  </section>
</template>
