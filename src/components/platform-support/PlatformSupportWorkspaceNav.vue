<script setup>
import { DataAnalysis, Document, Search, Tickets } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { PLATFORM_SUPPORT_ROUTE_NAMES } from '@/contracts/platform-support/platformSupportContract'

const { t } = useI18n()
const links = [
  { route: PLATFORM_SUPPORT_ROUTE_NAMES.oversight, label: 'platformSupport.navigation.oversight', icon: DataAnalysis },
  { route: PLATFORM_SUPPORT_ROUTE_NAMES.decisions, label: 'platformSupport.navigation.decisions', icon: Tickets },
  { route: PLATFORM_SUPPORT_ROUTE_NAMES.diagnostics, label: 'platformSupport.navigation.diagnostics', icon: Search },
  { route: PLATFORM_SUPPORT_ROUTE_NAMES.audit, label: 'platformSupport.navigation.audit', icon: Document },
]
</script>

<template>
  <nav class="mb-6 flex flex-wrap gap-2" :aria-label="t('platformSupport.navigation.workspace')">
    <RouterLink v-for="link in links" :key="link.route" :to="{ name: link.route }">
      <ElButton :icon="link.icon" plain>
        {{ t(link.label) }}
      </ElButton>
    </RouterLink>
  </nav>
</template>
