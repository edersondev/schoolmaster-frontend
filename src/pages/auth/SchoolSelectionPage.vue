<script setup>
import { useI18n } from 'vue-i18n'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthSessionStore } from '@/stores/auth/sessionStore'
import { isSystemAdministratorSession } from '@/contracts/auth/authSession.contract'
import { getPostAuthRoute } from '@/router/authGuards'
import { getAdminFallbackRoute } from '@/router/adminFallbackRoute'
import { AUTH_ROUTE_NAMES } from '@/router/modules/auth.routes'
import { ADMIN_ROUTE_NAMES } from '@/contracts/admin-system/navigation'
import SchoolContextSelector from '@/components/auth/SchoolContextSelector.vue'

const { t } = useI18n()
const store = useAuthSessionStore()
const router = useRouter()

onMounted(() => {
  if (!isSystemAdministratorSession(store)) {
    router.replace({ name: AUTH_ROUTE_NAMES.state })
  }
})

async function onConfirmed() {
  const destination = getPostAuthRoute(store, getAdminFallbackRoute, router)
  store.clearRequestedRoute()
  await router.replace(destination)
}

async function onManageSchools() {
  await router.push({ name: ADMIN_ROUTE_NAMES.schools })
}
</script>

<template>
  <article
    class="grid gap-[1.35rem] rounded-[1.25rem] border border-sm-brand/15 bg-white/85 p-[clamp(1.5rem,4vw,2.5rem)] shadow-[0_1.5rem_4rem_rgba(30,41,59,0.1)]"
  >
    <header>
      <h2 class="font-display text-4xl font-medium">
        {{ t('auth.schoolSelection.title') }}
      </h2>
      <p class="mt-[0.55rem] leading-[1.6] text-sm-muted">
        {{ t('auth.schoolSelection.subtitle') }}
      </p>
    </header>

    <SchoolContextSelector @confirmed="onConfirmed" @manage-schools="onManageSchools" />
  </article>
</template>
