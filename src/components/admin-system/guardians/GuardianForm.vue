<script setup>
import { useI18n } from 'vue-i18n'

const model = defineModel({ type: Object, required: true })
defineProps({
  errors: { type: Object, default: () => ({}) },
  studentOptions: { type: Array, default: () => [] },
  lookupLoading: { type: Boolean, default: false },
  canLookupStudents: { type: Boolean, default: false },
})
defineEmits(['search-students'])
const { t } = useI18n()
</script>
<template>
  <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
    <ElFormItem :label="t('administration.common.fullName')" required :error="errors.full_name?.[0]"
      ><ElInput v-model="model.fullName"
    /></ElFormItem>
    <ElFormItem
      :label="t('administration.common.relationship')"
      required
      :error="errors.relationship_type?.[0]"
      ><ElInput v-model="model.relationshipType"
    /></ElFormItem>
    <ElFormItem :label="t('administration.common.email')" :error="errors.contact_email?.[0]"
      ><ElInput v-model="model.contactEmail" type="email"
    /></ElFormItem>
    <ElFormItem :label="t('administration.common.phone')" :error="errors.contact_phone?.[0]"
      ><ElInput v-model="model.contactPhone"
    /></ElFormItem>
    <ElFormItem
      v-if="canLookupStudents"
      class="sm:col-span-2"
      :label="t('administration.common.students')"
      :error="errors.student_profile_ids?.[0]"
    >
      <ElSelect
        v-model="model.studentProfileIds"
        multiple
        filterable
        remote
        reserve-keyword
        :remote-method="(query) => $emit('search-students', query)"
        :loading="lookupLoading"
        class="w-full"
      >
        <ElOption
          v-for="student in studentOptions"
          :key="student.id"
          :label="student.label"
          :value="student.id"
        />
      </ElSelect>
    </ElFormItem>
  </div>
</template>
