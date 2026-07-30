<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { isSystemAdministratorSession } from '@/contracts/auth/authSession.contract'
import { useSchoolSelection } from '@/composables/auth/useSchoolSelection'
import { schoolSelectionService } from '@/services/auth/schoolSelectionService'
import { authService } from '@/services/auth/authService'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import SchoolSelectionList from './SchoolSelectionList.vue'
import SchoolSelectionSearch from './SchoolSelectionSearch.vue'

const props = defineProps({
  service: {
    type: Object,
    default: null,
  },
  sessionService: {
    type: Object,
    default: null,
  },
})
const emit = defineEmits(['confirmed', 'manage-schools'])
const { t } = useI18n()
const session = useAuthSessionStore()
const { selectionPendingSchoolId, feedbackState } = storeToRefs(session)
const selection = useSchoolSelection({ service: props.service ?? schoolSelectionService })
const actorAllowed = computed(() => isSystemAdministratorSession(session))
const selectionErrorKey = computed(() => {
  const state = feedbackState.value?.state ?? selection.error.value?.type
  return `auth.schoolSelection.errors.${state ?? 'temporary-unavailable'}`
})

async function safelyLoad(action) {
  try {
    await action()
  } catch {
    // Normalized feedback is rendered by this component.
  }
}

async function selectSchool(school) {
  if (selectionPendingSchoolId.value) return
  try {
    const confirmed = await session.selectSchool(school.id, {
      service: props.sessionService ?? authService,
    })
    if (confirmed?.activeSchool?.id === school.id) {
      emit('confirmed', confirmed.activeSchool)
    }
  } catch {
    // The session store owns safe selection feedback and identity-loss handling.
  }
}

onMounted(() => {
  if (actorAllowed.value) safelyLoad(selection.load)
})
</script>

<template>
  <section class="grid gap-5" aria-live="polite">
    <ElAlert
      v-if="!actorAllowed"
      :title="t(feedbackState ? selectionErrorKey : 'auth.schoolSelection.errors.forbidden')"
      type="error"
      :closable="false"
      show-icon
    />

    <template v-else>
      <SchoolSelectionSearch
        :initial-filters="selection.filters.value"
        :loading="selection.isLoading.value"
        @search="(filters) => safelyLoad(() => selection.search(filters))"
        @clear="safelyLoad(selection.clearFilters)"
      />

      <ElAlert
        v-if="selection.status.value === 'error' || feedbackState"
        :title="t(selectionErrorKey)"
        type="error"
        :closable="false"
        show-icon
      >
        <template #default>
          <ElButton link type="primary" @click="safelyLoad(selection.retry)">
            {{ t('auth.schoolSelection.retry') }}
          </ElButton>
        </template>
      </ElAlert>

      <div
        v-if="selection.isLoading.value"
        v-loading="true"
        class="min-h-36"
        :aria-label="t('auth.schoolSelection.loading')"
      />

      <ElEmpty
        v-else-if="selection.status.value === 'filtered-empty'"
        :description="t('auth.schoolSelection.filteredEmpty')"
      />
      <ElEmpty
        v-else-if="selection.status.value === 'empty'"
        :description="t('auth.schoolSelection.empty')"
      />
      <SchoolSelectionList
        v-else
        :schools="selection.schools.value"
        :loading="Boolean(selectionPendingSchoolId)"
        @select="selectSchool"
      />

      <ElPagination
        v-if="selection.meta.value.total > selection.meta.value.perPage"
        background
        layout="prev, pager, next"
        :current-page="selection.meta.value.page"
        :page-size="selection.meta.value.perPage"
        :total="selection.meta.value.total"
        :disabled="selection.isLoading.value"
        @current-change="(page) => safelyLoad(() => selection.goToPage(page))"
      />

      <div class="flex flex-wrap gap-2">
        <ElButton
          data-test="refresh-schools"
          :disabled="selection.isLoading.value"
          @click="safelyLoad(selection.refresh)"
        >
          {{ t('auth.schoolSelection.refresh') }}
        </ElButton>
        <ElButton link type="primary" @click="emit('manage-schools')">
          {{ t('auth.schoolSelection.manageSchools') }}
        </ElButton>
      </div>
    </template>
  </section>
</template>
