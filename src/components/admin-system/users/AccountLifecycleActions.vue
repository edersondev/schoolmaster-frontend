<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  eligibility: { type: Object, required: true },
  pending: { type: Boolean, default: false },
  deliveryOnly: { type: Boolean, default: false },
  delivery: { type: Object, default: null },
  deliveryPending: { type: Boolean, default: false },
  deliveryError: { type: Object, default: null },
})

const emit = defineEmits(['action', 'refresh', 'password-delivery'])
const { t } = useI18n()
const deliveryButton = ref(null)
let restoreDeliveryFocus = false
const actions = computed(() =>
  props.deliveryOnly
    ? []
    : [
        { key: 'lock', visible: props.eligibility.canLock },
        { key: 'unlock', visible: props.eligibility.canUnlock },
        { key: 'recover', visible: props.eligibility.canRecover },
        { key: 'reactivate', visible: props.eligibility.canReactivate },
      ],
)
const visibleActions = computed(() => actions.value.filter((action) => action.visible))
const deliverySummary = computed(() =>
  [props.delivery?.deliveryChannel, props.delivery?.deliveryRequestedAt]
    .filter(Boolean)
    .join(' · '),
)
const deliveryErrorKey = computed(() => {
  if (!props.deliveryError) return null
  if (props.deliveryError.type === 'rate-limited') return 'accountLifecycle.delivery.rateLimited'
  if (props.deliveryError.type === 'conflict') return 'accountLifecycle.delivery.conflict'
  if (props.deliveryError.type === 'unavailable') return 'accountLifecycle.delivery.unavailable'
  return 'accountLifecycle.delivery.denied'
})

watch(
  () => props.deliveryPending,
  async (pending, wasPending) => {
    const button = deliveryButton.value?.$el
    if (pending) {
      restoreDeliveryFocus = typeof document !== 'undefined' && document.activeElement === button
      return
    }
    if (!wasPending || !restoreDeliveryFocus) return

    restoreDeliveryFocus = false
    await nextTick()
    deliveryButton.value?.$el?.focus()
  },
)
</script>

<template>
  <section v-if="!eligibility.blocked" class="grid gap-4 border-t border-sm-border pt-6">
    <header>
      <h3 class="text-base font-semibold text-sm-ink">
        {{ t('accountLifecycle.actions.title') }}
      </h3>
    </header>
    <div class="flex flex-wrap gap-2">
      <ElButton
        v-for="entry in visibleActions"
        :key="entry.key"
        :loading="pending"
        @click="emit('action', entry.key)"
      >
        {{ t(`accountLifecycle.actions.${entry.key}`) }}
      </ElButton>
      <ElButton
        v-if="eligibility.canDeliverPassword"
        ref="deliveryButton"
        data-test="password-delivery-action"
        type="primary"
        :loading="deliveryPending"
        :disabled="pending"
        @click="emit('password-delivery')"
      >
        {{ t('accountLifecycle.delivery.action') }}
      </ElButton>
      <ElButton v-if="!deliveryOnly" plain @click="emit('refresh')">
        {{ t('accountLifecycle.actions.refresh') }}
      </ElButton>
    </div>
    <ElAlert
      v-if="delivery"
      data-test="password-delivery-result"
      type="success"
      :closable="false"
      :title="t('accountLifecycle.delivery.accepted')"
      :description="deliverySummary"
      show-icon
    />
    <ElAlert
      v-else-if="deliveryErrorKey"
      data-test="password-delivery-error"
      type="warning"
      :closable="false"
      :title="t(deliveryErrorKey)"
      show-icon
    />
  </section>
</template>
