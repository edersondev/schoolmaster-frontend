<script setup>
import AdminLifecycleStatusTag from '@/components/admin-system/shared/AdminLifecycleStatusTag.vue'

defineProps({
  classSection: { type: Object, default: null },
  conflict: { type: Object, default: null },
})
</script>

<template>
  <section class="rounded-lg border border-sm-border bg-sm-surface p-5">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="text-lg font-semibold text-sm-text">{{ classSection?.name || 'Class section' }}</h2>
        <p class="text-sm text-sm-muted">{{ classSection?.code || 'No code' }}</p>
      </div>
      <AdminLifecycleStatusTag :status="classSection?.status" />
    </div>
    <dl class="mt-5 grid gap-4 text-sm md:grid-cols-4">
      <div><dt class="text-sm-muted">Course</dt><dd class="font-medium">{{ classSection?.course || '—' }}</dd></div>
      <div><dt class="text-sm-muted">Classroom</dt><dd class="font-medium">{{ classSection?.classroom || '—' }}</dd></div>
      <div><dt class="text-sm-muted">Section</dt><dd class="font-medium">{{ classSection?.section || '—' }}</dd></div>
      <div><dt class="text-sm-muted">Group</dt><dd class="font-medium">{{ classSection?.group || '—' }}</dd></div>
    </dl>
    <ElAlert v-if="conflict" class="mt-4" :title="conflict.code || 'Dependency conflict'" type="warning" :closable="false" show-icon />
  </section>
</template>
