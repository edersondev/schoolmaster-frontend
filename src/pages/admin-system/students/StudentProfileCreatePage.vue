<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { createStudentProfileDraft, validateStudentProfileDraft } from '@/contracts/admin-system/student-profiles'
import { useStudentProfiles } from '@/composables/admin-system/useStudentProfiles'
import StudentProfileForm from '@/components/admin-system/students/StudentProfileForm.vue'

const router = useRouter()
const profiles = useStudentProfiles({ autoLoad: false })
const form = reactive(createStudentProfileDraft())

async function submit() {
  profiles.fieldErrors.value = validateStudentProfileDraft(form)
  if (Object.keys(profiles.fieldErrors.value).length > 0) return
  const record = await profiles.create(form)
  if (record?.id) router.push({ name: 'studentProfileDetail', params: { studentProfileId: record.id } })
}
</script>

<template>
  <main class="space-y-5">
    <header>
      <h1 class="text-2xl font-semibold text-sm-text">Create student</h1>
      <p class="text-sm text-sm-muted">Approved profile fields only</p>
    </header>
    <StudentProfileForm v-model="form" :field-errors="profiles.fieldErrors.value" @submit="submit" />
  </main>
</template>
