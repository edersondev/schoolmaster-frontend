<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useClassSections } from '@/composables/admin-system/useClassSections'
import ClassSectionForm from '@/components/admin-system/class-sections/ClassSectionForm.vue'

const router = useRouter()
const route = useRoute()
const sections = useClassSections({ autoLoad: false })

onMounted(() => {
  sections.form.academicPeriodId = String(route.query.academicPeriodId ?? '')
})

async function submit() {
  const record = await sections.save()
  if (record?.id) router.push({ name: 'classSectionDetail', params: { classSectionId: record.id }, query: route.query })
}
</script>

<template>
  <main class="space-y-5">
    <header><h1 class="text-2xl font-semibold text-sm-text">Create class section</h1></header>
    <ClassSectionForm v-model="sections.form" :field-errors="sections.fieldErrors.value" @submit="submit" />
  </main>
</template>
