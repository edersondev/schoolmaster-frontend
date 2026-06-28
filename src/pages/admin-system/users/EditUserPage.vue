<script setup>
import { computed, onMounted, shallowRef, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  createUserForm,
  mapUserForm,
  validateUserForm,
} from '@/contracts/admin-system/users'
import { useAdminCreateForm } from '@/composables/admin-system/useAdminCreateForm'
import { useAdminLookup } from '@/composables/admin-system/useAdminLookup'
import { useUnsavedChangesGuard } from '@/composables/admin-system/useUnsavedChangesGuard'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { normalizeAdministrationError } from '@/services/admin-system/administration-error-mapper'
import { listRoles } from '@/services/admin-system/roles'
import { getUser, updateUser } from '@/services/admin-system/users'
import AdminFeedbackState from '@/components/ui/admin/AdminFeedbackState.vue'
import AdminFormPage from '@/components/ui/admin/AdminFormPage.vue'
import UserForm from '@/components/admin-system/users/UserForm.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const sessionStore = useAuthSessionStore()
const { activeSchool } = storeToRefs(sessionStore)

const loadState = shallowRef('loading')
const loadError = shallowRef(null)
const userId = computed(() => String(route.params.userId ?? ''))
const tenantId = computed(() => activeSchool.value?.id ?? null)
const form = useAdminCreateForm({
  initialValues: createUserForm(),
  operationId: 'updateUser',
  routeName: route.name,
  validate: validateUserForm,
  submitter: (values) => updateUser(userId.value, values, { schoolId: tenantId.value }),
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
  return { name: 'usersList', query: route.query }
}

async function loadUser() {
  if (!tenantId.value) return

  loadState.value = 'loading'
  loadError.value = null

  try {
    const user = await getUser(userId.value, { schoolId: tenantId.value })
    form.reset(mapUserForm(user))
    loadState.value = 'ready'
  } catch (error) {
    loadError.value = normalizeAdministrationError(error, {
      operationId: 'getUser',
      routeName: route.name,
    })
    loadState.value = loadError.value.type
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
  <section v-if="loadState !== 'ready'" class="mx-auto flex w-full max-w-3xl flex-col gap-4">
    <h1 class="font-display text-2xl font-semibold text-sm-text">
      {{ t('administration.users.editTitle') }}
    </h1>
    <AdminFeedbackState :state="loadState" :feedback="loadError" @retry="loadUser" />
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
    <UserForm
      v-model="form.values"
      :errors="form.fieldErrors.value"
      :roles="roleLookup.options.value"
      :roles-loading="roleLookup.status.value === 'loading'"
      :lookup-meta="roleLookup.meta.value"
      show-status
      @lookup-page="roleLookup.setPage"
    />
  </AdminFormPage>
</template>
