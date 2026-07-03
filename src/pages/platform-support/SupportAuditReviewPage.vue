<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import SupportAuditEventList from '@/components/platform-support/SupportAuditEventList.vue'
import SupportAuditFilters from '@/components/platform-support/SupportAuditFilters.vue'
import { useSupportAuditReview } from '@/composables/platform-support/useSupportAuditReview'

const props = defineProps({
  access: { type: Object, default: null },
})

const { t } = useI18n()
const audit = useSupportAuditReview({ access: props.access })

onMounted(audit.load)
</script>

<template>
  <section class="space-y-6">
    <h1 class="text-2xl font-semibold text-slate-950">{{ t('platformSupport.audit.title') }}</h1>
    <SupportAuditFilters :filters="audit.state.filters" @update="audit.setFilters" />
    <SupportAuditEventList
      :items="audit.state.items"
      :feedback="audit.state.feedback"
      :empty-state="audit.emptyState.value"
    />
  </section>
</template>

