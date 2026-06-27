<script setup>
import { computed, shallowRef } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  createSchoolDeleteForm,
  validateSchoolDeleteForm,
} from '@/contracts/admin-system/schools'
import { deleteSchool, listSchools } from '@/services/admin-system/schools'
import { useAdminCreateForm } from '@/composables/admin-system/useAdminCreateForm'
import { useAdministrationResourceList } from '@/composables/admin-system/useAdministrationResourceList'
import AdminListPage from '@/components/ui/admin/AdminListPage.vue'
import AdminPagination from '@/components/ui/admin/AdminPagination.vue'
import SchoolFilters from '@/components/admin-system/schools/SchoolFilters.vue'
import SchoolDeleteDialog from '@/components/admin-system/schools/SchoolDeleteDialog.vue'
import SchoolTable from '@/components/admin-system/schools/SchoolTable.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const list = useAdministrationResourceList({
  resource: 'schools',
  loader: listSchools,
  operationId: 'listSchools',
  tenantOwned: false,
})
const canManage = computed(() => list.can(['schools.view', 'schools.manage']))
const deleteDialogOpen = shallowRef(false)
const selectedSchool = shallowRef(null)
const deleteForm = useAdminCreateForm({
  initialValues: createSchoolDeleteForm(),
  operationId: 'deleteSchool',
  routeName: route.name,
  validate: validateSchoolDeleteForm,
  submitter: (values) => deleteSchool(selectedSchool.value.id, values),
})

function onEdit(row) {
  router.push({
    name: 'schoolEdit',
    params: { schoolId: row.id },
    query: route.query,
  })
}

function onOpenDelete(row) {
  selectedSchool.value = row
  deleteForm.reset(createSchoolDeleteForm())
  deleteDialogOpen.value = true
}

function closeDeleteDialog() {
  deleteDialogOpen.value = false
  selectedSchool.value = null
  deleteForm.reset(createSchoolDeleteForm())
}

async function submitDelete() {
  try {
    await deleteForm.submit()
    ElMessage.success(t('administration.common.deleteSuccess'))
    closeDeleteDialog()
    await list.load(list.query.value)
  } catch {
    // Delete form owns normalized feedback.
  }
}
</script>
<template>
  <AdminListPage
    :title="t('administration.schools.title')"
    :state="list.status.value"
    :feedback="list.error.value"
    :can-create="list.can(['schools.view', 'schools.manage'])"
    :create-to="{ name: 'schoolCreate', query: $route.query }"
    @retry="list.retry()"
    @reset="list.resetFilters"
  >
    <template #filters>
      <SchoolFilters
        :status="list.query.value.status"
        @update:status="list.updateQuery({ status: $event })"
        @reset="list.resetFilters"
      />
    </template>
    <SchoolTable
      :rows="list.items.value"
      :can-manage="canManage"
      @edit="onEdit"
      @delete="onOpenDelete"
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
  <SchoolDeleteDialog
    v-model:open="deleteDialogOpen"
    v-model:values="deleteForm.values"
    :school-name="selectedSchool?.name ?? ''"
    :pending="deleteForm.pending.value"
    :field-errors="deleteForm.fieldErrors.value"
    :form-error="deleteForm.formError.value"
    @submit="submitDelete"
    @cancel="closeDeleteDialog"
  />
</template>
