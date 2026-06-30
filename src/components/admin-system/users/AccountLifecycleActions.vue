<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  eligibility: { type: Object, required: true },
  pending: { type: Boolean, default: false },
})

const emit = defineEmits(['action', 'refresh'])
const { t } = useI18n()
const actions = computed(() => [
  { key: 'lock', visible: props.eligibility.canLock },
  { key: 'unlock', visible: props.eligibility.canUnlock },
  { key: 'recover', visible: props.eligibility.canRecover },
  { key: 'reactivate', visible: props.eligibility.canReactivate },
])
const visibleActions = computed(() => actions.value.filter((action) => action.visible))
</script>

<template>
  <section class="grid gap-4 border-t border-sm-border pt-6">
    <header>
      <h3 class="text-base font-semibold text-sm-ink">
        {{ t('accountLifecycle.actions.title') }}
      </h3>
    </header>
    <ElAlert
      v-if="eligibility.blocked"
      :title="t('accountLifecycle.actions.blocked')"
      type="info"
      :closable="false"
      show-icon
    />
    <div v-else class="flex flex-wrap gap-2">
      <ElButton
        v-for="entry in visibleActions"
        :key="entry.key"
        :loading="pending"
        @click="emit('action', entry.key)"
      >
        {{ t(`accountLifecycle.actions.${entry.key}`) }}
      </ElButton>
      <ElButton plain @click="emit('refresh')">
        {{ t('accountLifecycle.actions.refresh') }}
      </ElButton>
    </div>
  </section>
</template>

