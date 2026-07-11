<script setup>
import SchoolAddressFields from './SchoolAddressFields.vue'
import SchoolBasicFields from './SchoolBasicFields.vue'
import SchoolBrandingFields from './SchoolBrandingFields.vue'
import SchoolInstitutionalFields from './SchoolInstitutionalFields.vue'

const model = defineModel({ type: Object, required: true })
const props = defineProps({
  activeTab: { type: String, required: true },
  errors: { type: Object, default: () => ({}) },
  tabErrors: { type: Object, default: () => ({}) },
  lookups: { type: Object, required: true },
  lookupStatus: { type: String, default: 'idle' },
  readonlyDocument: { type: Boolean, default: false },
})
const emit = defineEmits(['update:activeTab', 'status-change'])

function tabLabel(label, tab) {
  return props.tabErrors[tab] ? `${label} *` : label
}
</script>

<template>
  <ElTabs :model-value="activeTab" class="school-tabs" @update:model-value="emit('update:activeTab', $event)">
    <ElTabPane :label="tabLabel('Basic', 'basic')" name="basic">
      <SchoolBasicFields
        v-model="model"
        :errors="errors"
        :readonly-document="readonlyDocument"
        @status-change="emit('status-change', $event)"
      />
    </ElTabPane>

    <ElTabPane :label="tabLabel('Address', 'address')" name="address">
      <SchoolAddressFields v-model="model" :errors="errors" />
    </ElTabPane>

    <ElTabPane :label="tabLabel('Institutional', 'institutional')" name="institutional">
      <SchoolInstitutionalFields
        v-model="model"
        :errors="errors"
        :lookups="lookups"
        :lookup-status="lookupStatus"
      />
    </ElTabPane>

    <ElTabPane :label="tabLabel('Branding', 'branding')" name="branding">
      <SchoolBrandingFields v-model="model" :errors="errors" />
    </ElTabPane>
  </ElTabs>
</template>

<style scoped>
.school-tabs {
  --el-tabs-header-height: 44px;
}
</style>
