<script setup>
defineProps({
  rows: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})
defineEmits(['sort'])
</script>

<template>
  <ElTable
    v-loading="loading"
    :data="rows"
    class="w-full"
    table-layout="auto"
    @sort-change="$emit('sort', $event)"
  >
    <ElTableColumn
      v-for="column in columns"
      :key="column.prop"
      :prop="column.prop"
      :label="column.label"
      :min-width="column.minWidth ?? 140"
      :sortable="column.sortable ? 'custom' : false"
    >
      <template #default="{ row }">
        <slot :name="column.prop" :row="row">
          <span :class="column.primary ? 'font-medium text-sm-text' : 'text-sm-muted'">
            {{ row[column.prop] ?? '—' }}
          </span>
        </slot>
      </template>
    </ElTableColumn>
  </ElTable>
</template>
