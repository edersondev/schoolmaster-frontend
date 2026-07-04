<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AdvancedQuestionEditor from '@/components/assessments/AdvancedQuestionEditor.vue'
import AdvancedAssessmentStatusRegion from '@/components/assessments/AdvancedAssessmentStatusRegion.vue'
import { useAdvancedAssessmentAccess } from '@/composables/assessments/useAdvancedAssessmentAccess'
import { useAdvancedQuestionnaireAuthoring } from '@/composables/assessments/useAdvancedQuestionnaireAuthoring'

const route = useRoute()
const access = useAdvancedAssessmentAccess()
const options = computed(() => access.options.value)
const authoring = useAdvancedQuestionnaireAuthoring({ options: options.value })

onMounted(() => {
  if (!access.canAuthor.value.allowed) {
    authoring.state.feedback = access.canAuthor.value.feedback
    return
  }
  authoring.load(route.params.questionnaireId)
})
</script>

<template>
  <section class="space-y-5">
    <AdvancedAssessmentStatusRegion :busy="authoring.state.loading" :feedback="authoring.state.feedback" />
    <ElForm class="space-y-4" @submit.prevent>
      <ElFormItem label="Title">
        <ElInput v-model="authoring.state.draft.title" />
      </ElFormItem>
      <ElFormItem label="Description">
        <ElInput v-model="authoring.state.draft.description" type="textarea" :rows="3" />
      </ElFormItem>
      <AdvancedQuestionEditor
        v-for="(question, index) in authoring.state.draft.questions"
        :key="question.id ?? index"
        :question="question"
        @update="authoring.updateQuestion(index, $event)"
      />
      <div class="flex flex-wrap gap-2">
        <ElButton @click="authoring.addQuestion('long_text')">Add long text</ElButton>
        <ElButton @click="authoring.addQuestion('file_response')">Add file response</ElButton>
        <ElButton type="primary" :loading="authoring.state.pending" @click="authoring.save">Save questionnaire</ElButton>
      </div>
    </ElForm>
  </section>
</template>
