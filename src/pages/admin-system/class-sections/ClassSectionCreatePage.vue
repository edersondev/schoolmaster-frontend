<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useClassSections } from '@/composables/admin-system/useClassSections'
import ClassSectionForm from '@/components/admin-system/class-sections/ClassSectionForm.vue'
import AdminFormPage from '@/components/ui/admin/AdminFormPage.vue'

const router = useRouter()
const route = useRoute()
const sections = useClassSections({ autoLoad: false })

onMounted(() => {
  sections.form.academicPeriodId = String(route.query.academicPeriodId ?? '')
})

async function submit() {
  const record = await sections.save()
  if (record?.id)
    router.push({
      name: 'classSectionDetail',
      params: { classSectionId: record.id },
      query: route.query,
    })
}

function cancel() {
  router.push({ name: 'classSectionsList', query: route.query })
}
</script>

<template>
  <AdminFormPage
    title="Create class section"
    :pending="sections.pending.value"
    :field-errors="sections.fieldErrors.value"
    :form-error="sections.error.value"
    @submit="submit"
    @cancel="cancel"
  >
    <ClassSectionForm v-model="sections.form" :field-errors="sections.fieldErrors.value" />
  </AdminFormPage>
</template>
