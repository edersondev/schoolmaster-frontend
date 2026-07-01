import { computed, shallowRef } from 'vue'

export function useTeacherWorkflowStaleGuard() {
  const version = shallowRef(0)
  const activeKeys = shallowRef([])

  const token = computed(() => `${version.value}:${activeKeys.value.join('|')}`)

  function touch(keys = []) {
    activeKeys.value = keys.map((key) => String(key ?? ''))
    version.value += 1
    return token.value
  }

  function capture(keys = activeKeys.value) {
    return touch(keys)
  }

  function isCurrent(capturedToken) {
    return capturedToken === token.value
  }

  async function runLatest(keys, action, onStale) {
    const captured = capture(keys)
    const result = await action()
    if (!isCurrent(captured)) {
      onStale?.()
      return { stale: true, result: null }
    }
    return { stale: false, result }
  }

  return { token, version, touch, capture, isCurrent, runLatest }
}
