<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useStudentProfiles } from '@/composables/admin-system/useStudentProfiles'
import { useStudentEnrollmentRosterPermissions } from '@/composables/admin-system/useStudentEnrollmentRosterPermissions'
import AdminListPage from '@/components/ui/admin/AdminListPage.vue'
import AdminPagination from '@/components/ui/admin/AdminPagination.vue'
import StudentFilters from '@/components/admin-system/students/StudentFilters.vue'
import StudentTable from '@/components/admin-system/students/StudentTable.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const list = useStudentProfiles()
const permissions = useStudentEnrollmentRosterPermissions()

function openStudent(row) {
  router.push({
    name: 'studentProfileDetail',
    params: { studentProfileId: row.id },
    query: route.query,
  })
}
</script>

<template>
  <AdminListPage
    :title="t('studentEnrollmentRoster.students.title')"
    :state="list.status.value"
    :feedback="list.error.value"
    :can-create="permissions.canManageStudents.value"
    :create-to="{ name: 'studentProfileCreate', query: route.query }"
    @retry="list.load()"
    @reset="list.resetFilters()"
  >
    <template #filters>
      <StudentFilters
        :search="list.query.value.search"
        :status="list.query.value.status"
        @submit="list.updateQuery($event)"
        @reset="list.resetFilters()"
      />
    </template>

    <StudentTable :rows="list.items.value" @view="openStudent" />

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
</template>
