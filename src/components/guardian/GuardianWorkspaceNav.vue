<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { GUARDIAN_SELF_SERVICE_ROUTE_NAMES } from '@/contracts/guardian/guardianSelfServiceContract'

const props = defineProps({
  studentProfileId: { type: String, default: '' },
})

const { t } = useI18n()

const links = computed(() => [
  {
    name: GUARDIAN_SELF_SERVICE_ROUTE_NAMES.linkedStudents,
    label: 'guardianSelfService.navigation.linkedStudents',
    params: {},
  },
  {
    name: GUARDIAN_SELF_SERVICE_ROUTE_NAMES.studentDetail,
    label: 'guardianSelfService.navigation.studentDetail',
    params: { studentProfileId: props.studentProfileId },
    disabled: !props.studentProfileId,
  },
  {
    name: GUARDIAN_SELF_SERVICE_ROUTE_NAMES.academics,
    label: 'guardianSelfService.navigation.academics',
    params: { studentProfileId: props.studentProfileId },
    disabled: !props.studentProfileId,
  },
  {
    name: GUARDIAN_SELF_SERVICE_ROUTE_NAMES.contacts,
    label: 'guardianSelfService.navigation.contacts',
    params: { studentProfileId: props.studentProfileId },
    disabled: !props.studentProfileId,
  },
])

const visibleLinks = computed(() => links.value.filter((link) => !link.disabled))
</script>

<template>
  <nav class="mb-6 flex flex-wrap gap-2" :aria-label="t('guardianSelfService.navigation.workspace')">
    <RouterLink
      v-for="link in visibleLinks"
      :key="link.name"
      :to="{ name: link.name, params: link.params }"
      class="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
      active-class="border-slate-950 bg-slate-950 text-white"
    >
      {{ t(link.label) }}
    </RouterLink>
  </nav>
</template>
