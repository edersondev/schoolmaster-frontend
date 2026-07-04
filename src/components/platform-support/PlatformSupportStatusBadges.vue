<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  state: { type: String, default: '' },
  optInState: { type: String, default: '' },
  approvalState: { type: String, default: '' },
  suppressed: { type: Array, default: () => [] },
  redactedFields: { type: Array, default: () => [] },
})

const { t } = useI18n()
const badges = computed(() =>
  [
    props.state ? { key: 'state', label: props.state, type: typeFor(props.state) } : null,
    props.optInState ? { key: 'opt-in', label: props.optInState, type: typeFor(props.optInState) } : null,
    props.approvalState ? { key: 'approval', label: props.approvalState, type: typeFor(props.approvalState) } : null,
    ...props.suppressed.map((label) => ({ key: `suppressed-${label}`, label: `${t('platformSupport.labels.suppressed')}: ${label}`, type: 'warning' })),
    ...props.redactedFields.map((label) => ({ key: `redacted-${label}`, label: `${t('platformSupport.labels.redacted')}: ${label}`, type: 'info' })),
  ].filter(Boolean),
)

function typeFor(value) {
  if (['active', 'approved', 'valid'].includes(value)) return 'success'
  if (['requested', 'pending'].includes(value)) return 'info'
  if (['expired', 'revoked', 'denied', 'inactive'].includes(value)) return 'warning'
  return 'info'
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <ElTag v-for="badge in badges" :key="badge.key" :type="badge.type" effect="plain">
      {{ t(`platformSupport.states.${badge.label}`, badge.label) }}
    </ElTag>
  </div>
</template>

