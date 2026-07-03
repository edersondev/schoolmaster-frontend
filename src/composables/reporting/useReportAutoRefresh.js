import { onBeforeUnmount, shallowRef } from 'vue'

export function useReportAutoRefresh({ history, announce, intervalMs = 15000 } = {}) {
  const timer = shallowRef(null)

  function snapshot(items = []) {
    return Object.fromEntries(
      items.map((item) => [
        item.id,
        `${item.generationStatus}:${(item.outputs ?? []).map((output) => `${output.format}:${output.availability}`).join(',')}`,
      ]),
    )
  }

  async function refresh() {
    const before = snapshot(history?.state?.items)
    const result = await history?.load?.()
    const after = snapshot(history?.state?.items)
    Object.entries(after).forEach(([id, value]) => {
      if (before[id] && before[id] !== value) announce?.(`Report ${id} state changed.`)
    })
    return result
  }

  function stop() {
    if (timer.value) window.clearInterval(timer.value)
    timer.value = null
  }

  function start() {
    stop()
    if (!history?.pendingRuns?.value?.length || typeof window === 'undefined') return
    timer.value = window.setInterval(refresh, intervalMs)
  }

  onBeforeUnmount(stop)

  return { start, stop, refresh, timer }
}
