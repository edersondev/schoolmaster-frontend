<script setup>
import { Collection, DocumentAdd, Files } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { REPORTING_ROUTE_NAMES } from '@/contracts/reporting/reportingContract'

const { t } = useI18n()
const links = [
  { route: REPORTING_ROUTE_NAMES.history, label: 'reporting.navigation.history', icon: Files },
  { route: REPORTING_ROUTE_NAMES.catalog, label: 'reporting.navigation.catalog', icon: DocumentAdd },
  { route: REPORTING_ROUTE_NAMES.definitions, label: 'reporting.navigation.definitions', icon: Collection },
]
</script>

<template>
  <nav class="mb-6 flex flex-wrap gap-2" :aria-label="t('reporting.navigation.workspace')">
    <RouterLink v-for="link in links" :key="link.route" :to="{ name: link.route }">
      <ElButton :icon="link.icon" plain>
        {{ t(link.label) }}
      </ElButton>
    </RouterLink>
  </nav>
</template>
