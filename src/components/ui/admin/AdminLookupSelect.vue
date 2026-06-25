<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const model = defineModel({ required: true })
const props = defineProps({
  options: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false },
  page: { type: Number, default: 1 },
  perPage: { type: Number, default: 25 },
  total: { type: Number, default: 0 },
  placeholder: { type: String, default: '' },
})
const emit = defineEmits(['page'])
const { t } = useI18n()
const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.perPage)))
</script>

<template>
  <div class="grid w-full gap-2">
    <ElSelect
      v-model="model"
      :multiple="multiple"
      :loading="loading"
      :placeholder="placeholder || t('administration.common.select')"
      class="w-full"
    >
      <ElOption
        v-for="option in options"
        :key="option.id"
        :label="option.name ?? option.label"
        :value="option.id"
      />
    </ElSelect>
    <div
      v-if="total > perPage"
      class="flex items-center justify-between gap-3 text-sm text-sm-muted"
    >
      <ElButton size="small" :disabled="page <= 1 || loading" @click="emit('page', page - 1)">
        {{ t('administration.common.previous') }}
      </ElButton>
      <span>{{ t('administration.common.pageOf', { page, count: pageCount }) }}</span>
      <ElButton
        size="small"
        :disabled="page >= pageCount || loading"
        @click="emit('page', page + 1)"
      >
        {{ t('administration.common.next') }}
      </ElButton>
    </div>
  </div>
</template>
