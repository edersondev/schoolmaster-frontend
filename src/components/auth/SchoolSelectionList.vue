<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
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
const firstChoice = ref(null)
const activeSchools = computed(() => props.schools.filter((school) => school.status === 'active'))

watch(
  () => [props.loading, activeSchools.value],
  async ([loading]) => {
    if (!loading && activeSchools.value.length) {
      await nextTick()
      firstChoice.value?.focus()
    }
  },
  { immediate: true },
)

function accessibleName(school) {
  return t('auth.schoolSelection.choiceLabel', {
    name: school.name,
    inep: school.inepCode,
    city: school.city,
    state: school.state,
  })
}

function setFirstChoice(element) {
  firstChoice.value = element
}
</script>

<template>
  <div class="grid gap-3">
    <ElEmpty v-if="activeSchools.length === 0" :description="t('auth.schoolSelection.empty')" />
    <template v-else>
      <button
        v-for="(school, index) in activeSchools"
        :key="school.id"
        :ref="index === 0 ? setFirstChoice : undefined"
        class="flex w-full cursor-pointer items-center justify-between gap-4 rounded-[0.85rem] border border-sm-border bg-sm-surface p-4 text-left text-sm-text transition-colors hover:border-sm-brand disabled:pointer-events-none disabled:opacity-50"
        type="button"
        :aria-label="accessibleName(school)"
        :disabled="loading"
        @click="emit('select', school)"
      >
        <span class="grid gap-[0.2rem]">
          <strong>{{ school.name }}</strong>
          <small class="text-sm-muted">
            {{
              t('auth.schoolSelection.identity', {
                inep: school.inepCode || '—',
                city: school.city || '—',
                state: school.state || '—',
              })
            }}
          </small>
        </span>
        <span>{{ t('auth.schoolSelection.select') }}</span>
      </button>
    </template>
  </div>
</template>
