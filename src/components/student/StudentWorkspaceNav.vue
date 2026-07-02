<script setup>
import { Calendar, House, Management, User } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { STUDENT_SELF_SERVICE_ROUTE_NAMES } from '@/contracts/student/studentSelfServiceContract'

const { t } = useI18n()

const navItems = [
  {
    route: STUDENT_SELF_SERVICE_ROUTE_NAMES.assignedLearningSets,
    label: 'studentSelfService.navigation.assignedLearningSets',
    icon: Management,
  },
  {
    route: STUDENT_SELF_SERVICE_ROUTE_NAMES.grades,
    label: 'studentSelfService.navigation.grades',
    icon: User,
  },
  {
    route: STUDENT_SELF_SERVICE_ROUTE_NAMES.attendance,
    label: 'studentSelfService.navigation.attendance',
    icon: Calendar,
  },
  {
    route: STUDENT_SELF_SERVICE_ROUTE_NAMES.overview,
    label: 'studentSelfService.navigation.overview',
    icon: House,
  },
]
</script>

<template>
  <nav class="mb-6 flex flex-wrap gap-2" :aria-label="t('studentSelfService.navigation.workspace')">
    <RouterLink v-for="item in navItems" :key="item.route" :to="{ name: item.route }">
      <ElButton :icon="item.icon" plain>
        {{ t(item.label) }}
      </ElButton>
    </RouterLink>
  </nav>
</template>
