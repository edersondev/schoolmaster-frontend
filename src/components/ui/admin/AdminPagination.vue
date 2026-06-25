<script setup>
defineProps({
  page: { type: Number, required: true },
  perPage: { type: Number, required: true },
  total: { type: Number, required: true },
})
defineEmits(['update:page', 'update:perPage'])
</script>

<template>
  <ElPagination
    :current-page="page"
    :page-size="perPage"
    :page-sizes="[10, 25, 50, 100]"
    :total="total"
    layout="total, sizes, prev, pager, next"
    @update:current-page="$emit('update:page', $event)"
    @update:page-size="$emit('update:perPage', $event)"
  />
</template>
