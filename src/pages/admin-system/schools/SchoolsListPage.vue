<script setup>
import { computed, onMounted, reactive, shallowRef } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { deriveLifecycleActions } from '@/composables/admin-system/useAdminActionEligibility'
import { useAdminLifecycleAction } from '@/composables/admin-system/useAdminLifecycleAction'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import {
  activateSchool,
  deactivateSchool,
  deleteSchool,
  listSchools,
  restoreSchool,
} from '@/services/admin-system/schools'
import { useAdministrationResourceList } from '@/composables/admin-system/useAdministrationResourceList'
import { schoolModuleService } from '@/modules/schools/services/schoolService'
import AdminListPage from '@/components/ui/admin/AdminListPage.vue'
import AdminLifecycleDialog from '@/components/ui/admin/AdminLifecycleDialog.vue'
import AdminPagination from '@/components/ui/admin/AdminPagination.vue'
import SchoolFilters from '@/components/admin-system/schools/SchoolFilters.vue'
import SchoolTable from '@/components/admin-system/schools/SchoolTable.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const sessionStore = useAuthSessionStore()
const lookupStatus = shallowRef('loading')
const lookupOptions = reactive({
  administrativeTypes: [],
  legalNatures: [],
  managementTypes: [],
  pedagogicalApproaches: [],
})
const institutionalFilterMap = Object.freeze({
  administrativeTypeId: { options: 'administrativeTypes' },
  legalNatureId: { options: 'legalNatures' },
  managementTypeId: { options: 'managementTypes' },
  pedagogicalApproachId: { options: 'pedagogicalApproaches' },
})
const listEnabled = computed(() => lookupStatus.value !== 'loading')
const list = useAdministrationResourceList({
  resource: 'schools',
  loader: listSchools,
  operationId: 'listSchools',
  tenantOwned: false,
  enabled: listEnabled,
  sanitizeQuery: sanitizeSchoolListQuery,
})
const canManage = computed(() => list.can(['schools.view', 'schools.manage']))
const displayState = computed(() =>
  lookupStatus.value === 'loading' ? 'loading' : list.status.value,
)
const invalidFilterLabels = computed(() => {
  const labels = []
  const rawStatus = route.query.status
  if (rawStatus !== undefined && !['1', '0'].includes(String(rawStatus))) {
    labels.push(t('administration.common.status'))
  }
  if (lookupStatus.value !== 'ready') return labels
  for (const [key, config] of Object.entries(institutionalFilterMap)) {
    const value = list.query.value[key]
    if (value && !hasLookupOption(config.options, value)) {
      labels.push(t(`administration.common.${key.replace(/Id$/, '')}`))
    }
  }
  return labels
})
const filterWarning = computed(() => {
  if (lookupStatus.value === 'unavailable') return t('administration.schools.lookupUnavailable')
  if (!invalidFilterLabels.value.length) return ''
  return t('administration.schools.invalidFilters', {
    fields: invalidFilterLabels.value.join(', '),
  })
})
const lifecycle = useAdminLifecycleAction({
  routeName: route.name,
  submitter: ({ target, action, values }) => {
    const services = {
      activate: activateSchool,
      deactivate: deactivateSchool,
      delete: deleteSchool,
      restore: restoreSchool,
    }
    return services[action](target.id, values)
  },
  onSuccess: async () => {
    ElMessage.success(t('administration.common.updateSuccess'))
    await list.load(sanitizeSchoolListQuery(list.query.value))
  },
})

onMounted(loadFilterLookups)

async function loadFilterLookups() {
  lookupStatus.value = 'loading'
  try {
    Object.assign(lookupOptions, await schoolModuleService.listSchoolFilterLookups())
    lookupStatus.value = 'ready'
  } catch {
    lookupStatus.value = 'unavailable'
  }
}

function hasLookupOption(group, value) {
  return (lookupOptions[group] ?? []).some((option) => String(option.id) === String(value))
}

function sanitizeSchoolListQuery(query = {}) {
  const sanitized = { ...query }
  for (const [key, config] of Object.entries(institutionalFilterMap)) {
    if (
      lookupStatus.value !== 'ready' ||
      (query[key] && !hasLookupOption(config.options, query[key]))
    ) {
      delete sanitized[key]
    }
  }
  return sanitized
}

function applyFilters(filters) {
  return list.updateQuery(filters)
}

function onView(row) {
  router.push({ name: 'schoolDetail', params: { schoolId: row.id }, query: route.query })
}

function onEdit(row) {
  router.push({
    name: 'schoolEdit',
    params: { schoolId: row.id },
    query: route.query,
  })
}

function lifecycleActions(row) {
  return deriveLifecycleActions({
    resource: 'schools',
    status: row.status,
    permissions: sessionStore.permissionCodes,
    schoolReady: true,
  })
}

function onLifecycle({ row, action }) {
  lifecycle.launch(row, action)
}

async function submitLifecycle() {
  try {
    await lifecycle.submit()
  } catch {
    // useAdminLifecycleAction owns field and form error state.
  }
}
</script>
<template>
  <AdminListPage
    :title="t('administration.schools.title')"
    :state="displayState"
    :feedback="list.error.value"
    :can-create="list.can(['schools.view', 'schools.manage'])"
    :create-to="{ name: 'schoolCreate', query: $route.query }"
    @retry="list.retry()"
    @reset="list.resetFilters"
  >
    <template #filters>
      <ElAlert
        v-if="filterWarning"
        class="!mb-3"
        type="warning"
        :closable="false"
        show-icon
        data-test="school-filter-warning"
        :title="filterWarning"
      />
      <SchoolFilters
        :status="list.query.value.status ?? ''"
        :inep-code="list.query.value.inepCode ?? ''"
        :document="list.query.value.document ?? ''"
        :name="list.query.value.name ?? ''"
        :email="list.query.value.email ?? ''"
        :city="list.query.value.city ?? ''"
        :state="list.query.value.state ?? ''"
        :administrative-type-id="list.query.value.administrativeTypeId ?? ''"
        :legal-nature-id="list.query.value.legalNatureId ?? ''"
        :management-type-id="list.query.value.managementTypeId ?? ''"
        :pedagogical-approach-id="list.query.value.pedagogicalApproachId ?? ''"
        :lookup-options="lookupOptions"
        :lookup-status="lookupStatus"
        @submit="applyFilters"
        @reset="list.resetFilters"
      />
    </template>
    <SchoolTable
      :rows="list.items.value"
      :can-manage="canManage"
      :action-resolver="lifecycleActions"
      @view="onView"
      @edit="onEdit"
      @lifecycle="onLifecycle"
    />
    <template #pagination>
      <AdminPagination
        :page="list.meta.value.page"
        :per-page="list.meta.value.perPage"
        :total="list.meta.value.total"
        @update:page="list.updateQuery({ page: $event })"
        @update:per-page="list.updateQuery({ perPage: $event })"
      />
    </template>
  </AdminListPage>
  <AdminLifecycleDialog
    v-model:open="lifecycle.open.value"
    v-model:values="lifecycle.form"
    :action="lifecycle.action.value"
    :resource-label="lifecycle.target.value?.name ?? ''"
    resource-type="schools"
    :current-status="lifecycle.target.value?.status ?? ''"
    :pending="lifecycle.pending.value"
    :field-errors="lifecycle.fieldErrors.value"
    :form-error="lifecycle.formError.value"
    @submit="submitLifecycle"
    @cancel="lifecycle.close"
  />
</template>
