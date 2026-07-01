<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { useAcademicPeriodScope } from '@/composables/admin-system/useAcademicPeriodScope'
import { useClassSections } from '@/composables/admin-system/useClassSections'
import AcademicPeriodScopeSelector from '@/components/admin-system/shared/AcademicPeriodScopeSelector.vue'
import AdminLifecycleStatusTag from '@/components/admin-system/shared/AdminLifecycleStatusTag.vue'
import AdminSafeFeedbackState from '@/components/admin-system/shared/AdminSafeFeedbackState.vue'

const router = useRouter()
const scope = useAcademicPeriodScope()
const list = useClassSections()
const showFeedback = computed(() => !['ready'].includes(list.status.value))
</script>

<template>
  <main class="space-y-5">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold text-sm-text">Class sections</h1>
        <p class="text-sm text-sm-muted">Academic-period roster admin</p>
      </div>
      <ElButton type="primary" :icon="Plus" @click="router.push({ name: 'classSectionCreate', query: $route.query })">Create</ElButton>
    </header>
    <AcademicPeriodScopeSelector
      :model-value="scope.selectedAcademicPeriodId.value"
      :periods="scope.periods.value"
      :loading="scope.loading.value"
      :blocked="scope.blocked.value"
      @change="scope.selectPeriod"
      @retry="scope.load"
    />
    <ElSelect :model-value="list.query.value.status" class="w-44" clearable placeholder="Status" @update:model-value="list.updateQuery({ status: $event })">
      <ElOption label="Active" value="active" />
      <ElOption label="Inactive" value="inactive" />
    </ElSelect>
    <AdminSafeFeedbackState v-if="showFeedback" :state="list.status.value" :feedback="list.error.value" @retry="list.load()" />
    <div v-else class="w-full max-w-full overflow-x-auto">
      <div class="min-w-[44rem]">
        <ElTable :data="list.items.value" class="w-full">
          <ElTableColumn prop="code" label="Code" min-width="140" />
          <ElTableColumn prop="name" label="Name" min-width="220" />
          <ElTableColumn prop="course" label="Course" min-width="160" />
          <ElTableColumn label="Status" min-width="120">
            <template #default="{ row }"><AdminLifecycleStatusTag :status="row.status" compact /></template>
          </ElTableColumn>
          <ElTableColumn width="120">
            <template #default="{ row }"><ElButton size="small" @click="router.push({ name: 'classSectionDetail', params: { classSectionId: row.id }, query: $route.query })">View</ElButton></template>
          </ElTableColumn>
        </ElTable>
      </div>
    </div>
  </main>
</template>
