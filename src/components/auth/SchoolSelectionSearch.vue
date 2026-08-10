<script setup>
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  initialFilters: {
    type: Object,
    default: () => ({ name: '', inepCode: '' }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['search', 'clear'])
const { t } = useI18n()
const filters = reactive({ name: '', inepCode: '' })

watch(
  () => props.initialFilters,
  (value) => {
    filters.name = value?.name ?? ''
    filters.inepCode = value?.inepCode ?? ''
  },
  { immediate: true, deep: true },
)

function submit() {
  emit('search', { name: filters.name, inepCode: filters.inepCode })
}

function clear() {
  filters.name = ''
  filters.inepCode = ''
  emit('clear')
}
</script>

<template>
  <form class="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end" @submit.prevent="submit">
    <label class="grid gap-2" for="school-selection-name">
      <span class="text-sm font-semibold">{{ t('auth.schoolSelection.nameLabel') }}</span>
      <ElInput
        id="school-selection-name"
        v-model="filters.name"
        :placeholder="t('auth.schoolSelection.namePlaceholder')"
        :disabled="loading"
        clearable
        @keyup.enter="submit"
      />
    </label>

    <label class="grid gap-2" for="school-selection-inep">
      <span class="text-sm font-semibold">{{ t('auth.schoolSelection.inepLabel') }}</span>
      <ElInput
        id="school-selection-inep"
        v-model="filters.inepCode"
        :placeholder="t('auth.schoolSelection.inepPlaceholder')"
        :disabled="loading"
        clearable
        @keyup.enter="submit"
      />
    </label>

    <div class="flex gap-2">
      <ElButton native-type="submit" type="primary" :loading="loading">
        {{ t('auth.schoolSelection.search') }}
      </ElButton>
      <ElButton
        data-test="clear-school-filters"
        native-type="button"
        :disabled="loading"
        @click="clear"
      >
        {{ t('auth.schoolSelection.clear') }}
      </ElButton>
    </div>
  </form>
</template>
