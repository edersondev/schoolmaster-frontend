<script setup>
const model = defineModel({ type: Object, required: true })
defineProps({
  errors: { type: Object, default: () => ({}) },
  lookups: { type: Object, required: true },
  lookupStatus: { type: String, default: 'idle' },
})

const loading = (status) => status === 'loading'
const unavailable = (status) => status === 'unavailable'
</script>

<template>
  <div class="flex flex-col gap-4">
    <ElAlert
      v-if="unavailable(lookupStatus)"
      title="Institutional options unavailable"
      type="warning"
      :closable="false"
      show-icon
    />

    <div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
      <ElFormItem label="Administrative type" required :error="errors.administrative_type_id?.[0]">
        <ElSelect
          v-model="model.administrative_type_id"
          class="w-full"
          filterable
          :loading="loading(lookupStatus)"
          :disabled="unavailable(lookupStatus)"
        >
          <ElOption
            v-for="option in lookups.administrativeTypes"
            :key="option.id"
            :label="option.label"
            :value="option.id"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="Legal nature" required :error="errors.legal_nature_id?.[0]">
        <ElSelect
          v-model="model.legal_nature_id"
          class="w-full"
          filterable
          :loading="loading(lookupStatus)"
          :disabled="unavailable(lookupStatus)"
        >
          <ElOption
            v-for="option in lookups.legalNatures"
            :key="option.id"
            :label="option.label"
            :value="option.id"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="Management type" required :error="errors.management_type_id?.[0]">
        <ElSelect
          v-model="model.management_type_id"
          class="w-full"
          filterable
          :loading="loading(lookupStatus)"
          :disabled="unavailable(lookupStatus)"
        >
          <ElOption
            v-for="option in lookups.managementTypes"
            :key="option.id"
            :label="option.label"
            :value="option.id"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="Pedagogical approach" required :error="errors.pedagogical_approach_id?.[0]">
        <ElSelect
          v-model="model.pedagogical_approach_id"
          class="w-full"
          filterable
          :loading="loading(lookupStatus)"
          :disabled="unavailable(lookupStatus)"
        >
          <ElOption
            v-for="option in lookups.pedagogicalApproaches"
            :key="option.id"
            :label="option.label"
            :value="option.id"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="Education levels" required :error="errors.education_level_ids?.[0]">
        <ElSelect
          v-model="model.education_level_ids"
          class="w-full"
          multiple
          filterable
          :loading="loading(lookupStatus)"
          :disabled="unavailable(lookupStatus)"
        >
          <ElOption
            v-for="option in lookups.educationLevels"
            :key="option.id"
            :label="option.label"
            :value="option.id"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="Modalities" required :error="errors.modality_ids?.[0]">
        <ElSelect
          v-model="model.modality_ids"
          class="w-full"
          multiple
          filterable
          :loading="loading(lookupStatus)"
          :disabled="unavailable(lookupStatus)"
        >
          <ElOption
            v-for="option in lookups.modalities"
            :key="option.id"
            :label="option.label"
            :value="option.id"
          />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="Timezone" :error="errors.timezone?.[0]">
        <ElInput v-model="model.timezone" />
      </ElFormItem>

      <ElFormItem label="Language" :error="errors.language?.[0]">
        <ElInput v-model="model.language" />
      </ElFormItem>
    </div>
  </div>
</template>
