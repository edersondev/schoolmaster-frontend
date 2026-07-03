import { computed } from 'vue'

export function useReportingTimeFormatter({ timezone = 'UTC' } = {}) {
  const timeZone = computed(() => timezone?.value ?? timezone ?? 'UTC')

  function formatTimestamp(value) {
    if (!value) return 'Unavailable'
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: timeZone.value,
    }).format(new Date(value))
  }

  return { timeZone, formatTimestamp }
}
