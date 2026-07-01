<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { useStudentProfiles } from '@/composables/admin-system/useStudentProfiles'
import { useStudentEnrollmentRosterPermissions } from '@/composables/admin-system/useStudentEnrollmentRosterPermissions'
import AdminSafeFeedbackState from '@/components/admin-system/shared/AdminSafeFeedbackState.vue'
import AdminLifecycleStatusTag from '@/components/admin-system/shared/AdminLifecycleStatusTag.vue'

const router = useRouter()
const list = useStudentProfiles()
const permissions = useStudentEnrollmentRosterPermissions()
const showFeedback = computed(() => !['ready'].includes(list.status.value))

function openStudent(row) {
  router.push({ name: 'studentProfileDetail', params: { studentProfileId: row.id } })
}
</script>

<template>
  <main class="space-y-5">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold text-sm-text">Student profiles</h1>
        <p class="text-sm text-sm-muted">School-owned enrollment records</p>
      </div>
      <ElButton
        type="primary"
        :icon="Plus"
        :disabled="!permissions.canManageStudents.value"
        @click="router.push({ name: 'studentProfileCreate' })"
      >
        Create
      </ElButton>
    </header>
    <div class="flex flex-wrap gap-3">
      <ElInput
        :model-value="list.query.value.search"
        class="max-w-80"
        placeholder="Search"
        @update:model-value="list.updateQuery({ search: $event })"
      />
      <ElSelect
        :model-value="list.query.value.status"
        class="w-44"
        clearable
        placeholder="Status"
        @update:model-value="list.updateQuery({ status: $event })"
      >
        <ElOption label="Active" value="active" />
        <ElOption label="Inactive" value="inactive" />
        <ElOption label="Transferred" value="transferred" />
      </ElSelect>
    </div>
    <AdminSafeFeedbackState
      v-if="showFeedback"
      :state="list.status.value"
      :feedback="list.error.value"
      @retry="list.load()"
      @reset="list.resetFilters()"
    />
    <div v-else class="w-full max-w-full overflow-x-auto">
      <div class="min-w-[48rem]">
        <ElTable :data="list.items.value" class="w-full">
          <ElTableColumn prop="fullName" label="Student" min-width="220" />
          <ElTableColumn prop="registrationNumber" label="Registration" min-width="160" />
          <ElTableColumn prop="enrolledAt" label="Enrolled" min-width="140" />
          <ElTableColumn label="Status" min-width="140">
            <template #default="{ row }">
              <AdminLifecycleStatusTag :status="row.status" compact />
            </template>
          </ElTableColumn>
          <ElTableColumn width="120">
            <template #default="{ row }">
              <ElButton size="small" @click="openStudent(row)">View</ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </div>
    <ElPagination
      v-if="list.meta.value.total > list.meta.value.perPage"
      :current-page="list.meta.value.page"
      :page-size="list.meta.value.perPage"
      :total="list.meta.value.total"
      layout="prev, pager, next"
      @update:current-page="list.updateQuery({ page: $event })"
    />
  </main>
</template>
