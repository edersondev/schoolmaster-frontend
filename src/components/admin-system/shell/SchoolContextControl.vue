<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  school: { type: Object, default: null },
  canSwitch: { type: Boolean, default: false },
})
const emit = defineEmits(['choose-school'])
const { t } = useI18n()
const label = computed(() => props.school?.name || t('adminSystem.shell.schoolUnresolved'))
</script>

<template>
  <div
    class="flex min-w-0 items-center gap-2 rounded-full border border-sm-border bg-white px-3 py-2"
  >
    <span class="min-w-0 truncate text-sm font-semibold" :title="label">{{ label }}</span>
    <ElButton v-if="canSwitch" link type="primary" @click="emit('choose-school')">
      {{ t('adminSystem.shell.chooseSchool') }}
    </ElButton>
  </div>
</template>
