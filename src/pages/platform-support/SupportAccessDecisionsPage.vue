<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PlatformSupportFeedbackState from '@/components/platform-support/PlatformSupportFeedbackState.vue'
import SupportAccessDecisionDetail from '@/components/platform-support/SupportAccessDecisionDetail.vue'
import SupportAccessRequestForm from '@/components/platform-support/SupportAccessRequestForm.vue'
import SupportApprovalControls from '@/components/platform-support/SupportApprovalControls.vue'
import SupportOptInStatePanel from '@/components/platform-support/SupportOptInStatePanel.vue'
import { useSupportAccessDecision } from '@/composables/platform-support/useSupportAccessDecision'
import { useSupportApprovalActions } from '@/composables/platform-support/useSupportApprovalActions'

const props = defineProps({
  access: { type: Object, default: null },
})

const route = useRoute()
const { t } = useI18n()
const decisions = useSupportAccessDecision({ access: props.access })
const approval = useSupportApprovalActions({
  access: props.access,
  onDecision: decisions.applyDecision,
})
const supportAccessId = computed(() => route.params.supportAccessId)

onMounted(() => {
  if (supportAccessId.value) decisions.loadDecision(supportAccessId.value)
})
</script>

<template>
  <section class="space-y-6">
    <h1 class="text-2xl font-semibold text-slate-950">{{ t('platformSupport.decisions.title') }}</h1>
    <PlatformSupportFeedbackState :feedback="decisions.state.feedback || approval.state.feedback" />
    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div class="space-y-6">
        <SupportAccessRequestForm
          :draft="decisions.state.draft"
          :can-submit="decisions.canSubmit.value"
          :submitting="decisions.state.submitting"
          @update="decisions.updateDraft"
          @submit="decisions.requestAccess"
        />
        <SupportAccessDecisionDetail :decision="decisions.state.decision" :feedback="decisions.state.feedback" />
      </div>
      <div class="space-y-6">
        <SupportOptInStatePanel :decision="decisions.state.decision" />
        <SupportApprovalControls
          :reason-code="approval.state.reasonCode"
          :pending-action="approval.state.pendingAction"
          :can-approve="approval.canApprove.value"
          :can-revoke="approval.canRevoke.value"
          @update-reason="approval.setReasonCode"
          @approve="approval.approve(decisions.state.decision)"
          @revoke="approval.revoke(decisions.state.decision)"
        />
      </div>
    </div>
  </section>
</template>

