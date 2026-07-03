<script setup>
import { computed, onMounted, shallowRef } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PlatformSupportRefreshStatus from '@/components/platform-support/PlatformSupportRefreshStatus.vue'
import SupportDiagnosticGroups from '@/components/platform-support/SupportDiagnosticGroups.vue'
import SupportDiagnosticsGate from '@/components/platform-support/SupportDiagnosticsGate.vue'
import SupportUnsupportedActionsGuard from '@/components/platform-support/SupportUnsupportedActionsGuard.vue'
import { useSupportAccessDecision } from '@/composables/platform-support/useSupportAccessDecision'
import { useSupportDecisionRefresh } from '@/composables/platform-support/useSupportDecisionRefresh'
import { useSupportDiagnostics } from '@/composables/platform-support/useSupportDiagnostics'

const props = defineProps({
  access: { type: Object, default: null },
})

const route = useRoute()
const { t } = useI18n()
const announcement = shallowRef('')
const decisions = useSupportAccessDecision({ access: props.access })
const diagnostics = useSupportDiagnostics({ access: props.access })
const refresh = useSupportDecisionRefresh({
  decisionState: decisions,
  diagnostics,
  announce: (message) => {
    announcement.value = message
  },
})
const schoolId = computed(() => route.query.schoolId || decisions.state.decision?.targetSchoolId)
const supportAccessId = computed(() => route.query.supportAccessId)

async function load() {
  if (supportAccessId.value) {
    await decisions.loadDecision(supportAccessId.value)
    await diagnostics.load({ schoolId: schoolId.value, decision: decisions.state.decision })
    refresh.start()
  }
}

onMounted(load)
</script>

<template>
  <section class="space-y-6">
    <h1 class="text-2xl font-semibold text-slate-950">{{ t('platformSupport.diagnostics.title') }}</h1>
    <p class="sr-only" aria-live="polite">{{ announcement && t(announcement) }}</p>
    <PlatformSupportRefreshStatus
      :pending="refresh.state.pending"
      :last-refreshed-at="refresh.state.lastRefreshedAt"
      :feedback="refresh.state.feedback"
      @refresh="refresh.refreshNow"
    />
    <div class="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
      <div class="space-y-6">
        <SupportDiagnosticsGate :decision="decisions.state.decision" :feedback="diagnostics.state.feedback" />
        <SupportUnsupportedActionsGuard />
      </div>
      <SupportDiagnosticGroups :diagnostics="diagnostics.state.diagnostics" />
    </div>
  </section>
</template>

