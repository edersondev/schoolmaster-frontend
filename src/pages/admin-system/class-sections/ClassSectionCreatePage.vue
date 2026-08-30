<script setup>
import { computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAcademicPeriodScope } from '@/composables/admin-system/useAcademicPeriodScope'
import { useClassSections } from '@/composables/admin-system/useClassSections'
import ClassSectionForm from '@/components/admin-system/class-sections/ClassSectionForm.vue'
import AdminFormPage from '@/components/ui/admin/AdminFormPage.vue'

const router = useRouter()
const route = useRoute()
const scope = useAcademicPeriodScope()
const sections = useClassSections({ autoLoad: false })
const metadataOptions = computed(() => ({
  course: collectMetadataOptions('course'),
  classroom: collectMetadataOptions('classroom'),
  section: collectMetadataOptions('section'),
  group: collectMetadataOptions('group'),
}))

watch(
  () => scope.selectedAcademicPeriodId.value,
  async (academicPeriodId) => {
    sections.form.academicPeriodId = academicPeriodId
    if (!academicPeriodId) return
    await sections.load({ academicPeriodId, perPage: 100 })
  },
  { immediate: true },
)

function collectMetadataOptions(field) {
  return [...new Set(sections.items.value.map((section) => section[field]).filter(Boolean))].sort()
}

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
    <ClassSectionForm
      v-model="sections.form"
      :field-errors="sections.fieldErrors.value"
      :period-options="scope.periods.value"
      :periods-loading="scope.loading.value"
      :metadata-options="metadataOptions"
      @academic-period-change="scope.selectPeriod"
    />
  </AdminFormPage>
</template>
