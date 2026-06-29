<script setup>
import { computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  createUserForm,
  mapUserForm,
  validateUserForm,
} from '@/contracts/admin-system/users'
import { useAdminDetail } from '@/composables/admin-system/useAdminDetail'
import { useAdminUpdateForm } from '@/composables/admin-system/useAdminUpdateForm'
import { useAdminLookup } from '@/composables/admin-system/useAdminLookup'
import { useUnsavedChangesGuard } from '@/composables/admin-system/useUnsavedChangesGuard'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { listRoles } from '@/services/admin-system/roles'
import { getUser, updateUser } from '@/services/admin-system/users'
import { createReturnToListLocation } from '@/router/modules/administration-route'
import AdminFeedbackState from '@/components/ui/admin/AdminFeedbackState.vue'
import AdminFormPage from '@/components/ui/admin/AdminFormPage.vue'
import UserEditFields from '@/components/admin-system/users/UserEditFields.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const sessionStore = useAuthSessionStore()
const { activeSchool } = storeToRefs(sessionStore)

const userId = computed(() => String(route.params.userId ?? ''))
const tenantId = computed(() => activeSchool.value?.id ?? null)
const detail = useAdminDetail({
  id: userId,
  schoolId: tenantId,
  schoolRequired: true,
  loader: getUser,
  operationId: 'getUser',
  routeName: route.name,
})
const form = useAdminUpdateForm({
  initialValues: createUserForm(),
  operationId: 'updateUser',
  routeName: route.name,
  validate: validateUserForm,
  submitter: (values) => updateUser(userId.value, values, { schoolId: tenantId.value }),
  mapResult: mapUserForm,
})
const selectedRoleIds = computed(() => form.values.roleIds)
const roleLookup = useAdminLookup({
  loader: listRoles,
  tenantId,
  selectedIds: selectedRoleIds,
  operationId: 'listRoles',
  status: 'active',
})

useUnsavedChangesGuard({ isDirty: form.isDirty, submitted: form.submitted })

function destination() {
  return createReturnToListLocation(route, 'usersList')
}

async function loadUser() {
  const user = await detail.load()
  if (user) {
    form.reset(mapUserForm(user))
  }
}

async function submit() {
  try {
    await form.submit()
    ElMessage.success(t('administration.common.updateSuccess'))
    await router.push(destination())
  } catch {
    // Edit form owns normalized feedback.
  }
}

function cancel() {
  router.push(destination())
}

onMounted(() => {
  if (tenantId.value) roleLookup.load(1)
})

watch([userId, tenantId], loadUser, { immediate: true })
</script>

<template>
  <section v-if="detail.status.value !== 'ready'" class="mx-auto flex w-full max-w-3xl flex-col gap-4">
    <h1 class="font-display text-2xl font-semibold text-sm-text">
      {{ t('administration.users.editTitle') }}
    </h1>
    <AdminFeedbackState :state="detail.status.value" :feedback="detail.error.value" @retry="loadUser" />
    <div class="flex justify-end">
      <ElButton @click="cancel">{{ t('administration.common.cancel') }}</ElButton>
    </div>
  </section>

  <AdminFormPage
    v-else
    :title="t('administration.users.editTitle')"
    :pending="form.pending.value"
    :field-errors="form.fieldErrors.value"
    :form-error="form.formError.value"
    :submit-label="t('administration.common.update')"
    @submit="submit"
    @cancel="cancel"
  >
    <UserEditFields
      v-model="form.values"
      :errors="form.fieldErrors.value"
      :roles="roleLookup.options.value"
      :roles-loading="roleLookup.status.value === 'loading'"
      :lookup-meta="roleLookup.meta.value"
      @lookup-page="roleLookup.setPage"
    />
  </AdminFormPage>
</template>
