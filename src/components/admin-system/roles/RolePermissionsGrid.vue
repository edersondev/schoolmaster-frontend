<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  permissions: { type: Array, default: () => [] },
})
const { t } = useI18n()
const items = computed(() => (Array.isArray(props.permissions) ? props.permissions : []))
</script>

<template>
  <div
    v-if="items.length"
    data-test="permission-grid"
    class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
  >
    <div
      v-for="permission in items"
      :key="permission.id ?? permission.code"
      data-test="permission-card"
      class="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-4"
    >
      <p class="break-words font-medium text-slate-900">
        <span class="sr-only">{{ t('administration.roles.permissionName') }}: </span>
        {{ permission.code }}
      </p>
      <p class="mt-1 text-sm text-slate-600">
        <span class="sr-only">{{ t('administration.common.description') }}: </span>
        {{ permission.name }}
      </p>
    </div>
  </div>
  <p v-else data-test="permission-grid-empty" class="py-6 text-center text-sm text-slate-500">
    {{ t('administration.roles.noPermissions') }}
  </p>
</template>
