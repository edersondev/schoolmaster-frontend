<script setup>
import { computed, onMounted, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ReportCatalogBrowser from '@/components/reporting/ReportCatalogBrowser.vue'
import ReportDefinitionDetail from '@/components/reporting/ReportDefinitionDetail.vue'
import ReportDefinitionEditor from '@/components/reporting/ReportDefinitionEditor.vue'
import ReportDefinitionsList from '@/components/reporting/ReportDefinitionsList.vue'
import ReportHistoryList from '@/components/reporting/ReportHistoryList.vue'
import ReportRequestForm from '@/components/reporting/ReportRequestForm.vue'
import ReportRetryCancelDialogs from '@/components/reporting/ReportRetryCancelDialogs.vue'
import ReportRunDetail from '@/components/reporting/ReportRunDetail.vue'
import ReportingAnnouncementRegion from '@/components/reporting/ReportingAnnouncementRegion.vue'
import ReportingFeedbackState from '@/components/reporting/ReportingFeedbackState.vue'
import ReportingWorkspaceNav from '@/components/reporting/ReportingWorkspaceNav.vue'
import { useReportAutoRefresh } from '@/composables/reporting/useReportAutoRefresh'
import { useReportCatalog } from '@/composables/reporting/useReportCatalog'
import { useReportDefinitionEditor } from '@/composables/reporting/useReportDefinitionEditor'
import { useReportDefinitionLifecycle } from '@/composables/reporting/useReportDefinitionLifecycle'
import { useReportDefinitions } from '@/composables/reporting/useReportDefinitions'
import { useReportDownloads } from '@/composables/reporting/useReportDownloads'
import { useReportHistory } from '@/composables/reporting/useReportHistory'
import { useReportLifecycleActions } from '@/composables/reporting/useReportLifecycleActions'
import { useReportRequestForm } from '@/composables/reporting/useReportRequestForm'
import { useReportRunDetail } from '@/composables/reporting/useReportRunDetail'
import { useReportingAccess } from '@/composables/reporting/useReportingAccess'
import { useReportingTimeFormatter } from '@/composables/reporting/useReportingTimeFormatter'
import { REPORTING_ROUTE_NAMES } from '@/contracts/reporting/reportingContract'

const route = useRoute()
const router = useRouter()
const access = useReportingAccess()
const catalog = useReportCatalog({ access })
const history = useReportHistory({ access })
const definitions = useReportDefinitions({ access })
const requestForm = useReportRequestForm({ access, catalog, definitions })
const downloads = useReportDownloads({ access })
const lifecycle = useReportLifecycleActions({ access, history })
const definitionEditor = useReportDefinitionEditor({ access, definitions })
const definitionLifecycle = useReportDefinitionLifecycle({ access, definitions })
const detail = useReportRunDetail({ history, reportRunId: computed(() => route.params.reportRunId) })
const { formatTimestamp } = useReportingTimeFormatter({ timezone: access.schoolTimezone })
const announcement = shallowRef('')
const lifecycleDialogVisible = shallowRef(false)
const lifecycleDialogAction = shallowRef('')
const lifecycleReasonCode = computed({
  get: () => lifecycle.state.reasonCode,
  set: (value) => lifecycle.setReasonCode(value),
})
const autoRefresh = useReportAutoRefresh({
  history,
  announce: (message) => {
    announcement.value = message
  },
})

const activeSurface = computed(() => route.name)
const selectedDefinition = computed(() =>
  definitions.selectedDefinition.value ??
  definitions.state.items.find((item) => item.id === route.params.reportDefinitionId) ??
  null,
)

async function loadSurface() {
  if (!access.isReady) return
  if ([REPORTING_ROUTE_NAMES.history, REPORTING_ROUTE_NAMES.runDetail].includes(activeSurface.value)) {
    await history.load()
    if (route.params.reportRunId) history.selectRun(route.params.reportRunId)
    autoRefresh.start()
  }
  if (activeSurface.value === REPORTING_ROUTE_NAMES.catalog) {
    await catalog.load()
    await definitions.load()
  }
  if ([REPORTING_ROUTE_NAMES.definitions, REPORTING_ROUTE_NAMES.definitionDetail].includes(activeSurface.value)) {
    await catalog.load({ forDefinitions: true })
    await definitions.load()
    if (route.params.reportDefinitionId) {
      definitions.selectDefinition(route.params.reportDefinitionId)
      if (!definitions.selectedDefinition.value) {
        await definitions.loadDefinition(route.params.reportDefinitionId)
      }
    }
  }
}

function selectRun(run) {
  history.selectRun(run.id)
  router.push({ name: REPORTING_ROUTE_NAMES.runDetail, params: { reportRunId: run.id } })
}

async function submitRequest() {
  const run = await requestForm.submit()
  if (run) {
    history.applyReturnedRun(run)
    router.push({ name: REPORTING_ROUTE_NAMES.runDetail, params: { reportRunId: run.id } })
  }
}

function openLifecycle(action) {
  lifecycleDialogAction.value = action
  if (['retry', 'cancel'].includes(action)) lifecycleDialogVisible.value = true
  else lifecycle.submit(detail.run.value, action)
}

async function confirmLifecycle() {
  await lifecycle.submit(detail.run.value, lifecycleDialogAction.value)
  lifecycleDialogVisible.value = false
}

function selectDefinition(definition) {
  definitions.selectDefinition(definition.id)
  router.push({ name: REPORTING_ROUTE_NAMES.definitionDetail, params: { reportDefinitionId: definition.id } })
}

function newDefinition() {
  definitionEditor.edit()
}

function requestFromDefinition(definition) {
  requestForm.resetDraft({ reportDefinitionId: definition.id, outputFormats: definition.outputFormats })
  router.push({ name: REPORTING_ROUTE_NAMES.catalog })
}

watch(() => route.fullPath, loadSurface)
watch(() => history.pendingRuns.value.length, () => autoRefresh.start())

onMounted(loadSurface)
</script>

<template>
  <main class="mx-auto w-full max-w-7xl px-4 py-6">
    <ReportingWorkspaceNav />
    <ReportingAnnouncementRegion :message="announcement" />
    <ReportingFeedbackState v-if="!access.isReady" :feedback="access.feedbackState" />

    <div v-else class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div class="space-y-6">
        <ReportHistoryList
          v-if="[REPORTING_ROUTE_NAMES.history, REPORTING_ROUTE_NAMES.runDetail].includes(activeSurface)"
          :items="history.state.items"
          :feedback="history.state.feedback"
          :empty-state="history.emptyState.value"
          :pagination="history.state.meta"
          @select="selectRun"
          @refresh="history.load"
          @page-change="history.setPage"
        />

        <template v-if="activeSurface === REPORTING_ROUTE_NAMES.catalog">
          <ReportCatalogBrowser :catalog="catalog.state.catalog" :feedback="catalog.state.feedback">
            <template #actions>
              <ElButton @click="catalog.load()">{{ $t('reporting.actions.refresh') }}</ElButton>
            </template>
          </ReportCatalogBrowser>
          <ReportRequestForm
            :draft="requestForm.state.draft"
            :catalog="catalog.state.catalog"
            :definitions="requestForm.activeDefinitions.value"
            :feedback="requestForm.state.feedback"
            :can-submit="requestForm.canSubmit.value"
            @submit="submitRequest"
          />
        </template>

        <template v-if="[REPORTING_ROUTE_NAMES.definitions, REPORTING_ROUTE_NAMES.definitionDetail].includes(activeSurface)">
          <ReportDefinitionsList
            :items="definitions.state.items"
            :feedback="definitions.state.feedback"
            :empty-state="definitions.emptyState.value"
            @select="selectDefinition"
            @new="newDefinition"
          />
          <ReportDefinitionDetail
            :definition="selectedDefinition"
            @edit="definitionEditor.edit"
            @action="definitionLifecycle.submit(selectedDefinition, $event)"
            @request="requestFromDefinition"
          />
          <ReportDefinitionEditor
            :draft="definitionEditor.state.draft"
            :catalog="catalog.state.catalog"
            :feedback="definitionEditor.state.feedback || definitionLifecycle.state.feedback"
            :can-submit="definitionEditor.canSubmit.value"
            :is-active="definitionEditor.isActive.value"
            :complexity-usage="definitionEditor.complexityUsage.value"
            @submit="definitionEditor.submit"
          />
        </template>
      </div>

      <ReportRunDetail
        v-if="[REPORTING_ROUTE_NAMES.history, REPORTING_ROUTE_NAMES.runDetail].includes(activeSurface)"
        :run="detail.run.value"
        :feedback="detail.feedback.value || lifecycle.state.feedback"
        :format-timestamp="formatTimestamp"
        :downloads="downloads"
        :lifecycle="lifecycle"
        @download="downloads.download(detail.run.value, $event)"
        @lifecycle="openLifecycle"
      />
    </div>

    <ReportRetryCancelDialogs
      v-model="lifecycleDialogVisible"
      v-model:reason-code="lifecycleReasonCode"
      :action="lifecycleDialogAction"
      :reason-options="lifecycle.reasonOptions.value"
      @confirm="confirmLifecycle"
    />
  </main>
</template>
