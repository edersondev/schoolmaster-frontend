<script setup>
import PlatformSupportFeedbackState from '@/components/platform-support/PlatformSupportFeedbackState.vue'
import PlatformSupportWorkspaceNav from '@/components/platform-support/PlatformSupportWorkspaceNav.vue'
import { usePlatformSupportAccess } from '@/composables/platform-support/usePlatformSupportAccess'

const access = usePlatformSupportAccess()
</script>

<template>
  <main class="mx-auto w-full max-w-7xl px-4 py-6">
    <PlatformSupportWorkspaceNav />
    <PlatformSupportFeedbackState v-if="!access.isReady" :feedback="access.feedbackState" />
    <RouterView v-else v-slot="{ Component }">
      <component :is="Component" :access="access" />
    </RouterView>
  </main>
</template>
