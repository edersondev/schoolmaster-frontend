<script setup>
import { useI18n } from 'vue-i18n'
import { formatCnpj } from '@/utils/cnpj'

defineProps({
  schools: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select'])
const { t } = useI18n()
</script>

<template>
  <div class="grid gap-3">
    <ElEmpty v-if="schools.length === 0" :description="t('auth.schoolSelection.empty')" />
    <template v-else>
      <button
        v-for="school in schools"
        :key="school.id"
        class="flex w-full cursor-pointer items-center justify-between gap-4 rounded-[0.85rem] border border-sm-border bg-sm-surface p-4 text-left text-sm-text transition-colors hover:border-sm-brand disabled:pointer-events-none disabled:opacity-50"
        type="button"
        :disabled="loading"
        @click="emit('select', school)"
      >
        <span class="grid gap-[0.2rem]">
          <strong>{{ school.name }}</strong>
          <small class="text-sm-muted">{{ formatCnpj(school.cnpj) || school.code }}</small>
        </span>
        <span>{{ t('auth.schoolSelection.select') }}</span>
      </button>
    </template>
  </div>
</template>
