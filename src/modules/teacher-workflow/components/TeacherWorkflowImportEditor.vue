<script setup>
const state = defineModel({ type: Object, required: true })
const props = defineProps({
  rowCount: { type: Number, default: 0 },
  pending: { type: Boolean, default: false },
})
const emit = defineEmits(['parse', 'submit'])
</script>

<template>
  <section class="grid gap-4 rounded-2xl border border-sm-border bg-sm-surface p-5">
    <ElAlert
      title="Structured JSON only"
      description="CSV, spreadsheet, archive, and file-upload imports are not available. Rejected imports apply no partial success."
      type="info"
      :closable="false"
      show-icon
    />
    <ElRadioGroup v-model="state.mode">
      <ElRadioButton label="grade">Grades</ElRadioButton>
      <ElRadioButton label="attendance">Attendance</ElRadioButton>
    </ElRadioGroup>
    <ElFormItem label="JSON rows">
      <ElInput v-model="state.json" type="textarea" :rows="12" />
    </ElFormItem>
    <div class="flex flex-wrap items-center gap-3">
      <ElTag>Rows: {{ rowCount }}</ElTag>
      <ElTag v-if="state.result" type="success">Accepted: {{ state.result.acceptedRowCount }}</ElTag>
      <ElTag v-if="state.result" type="danger">Rejected: {{ state.result.rejectedRowCount }}</ElTag>
    </div>
    <div class="flex flex-wrap gap-2">
      <ElButton @click="emit('parse')">Validate JSON</ElButton>
      <ElButton type="primary" :loading="pending" @click="emit('submit')">Submit import</ElButton>
    </div>
  </section>
</template>
