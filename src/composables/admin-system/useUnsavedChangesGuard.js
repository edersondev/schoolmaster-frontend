import { onBeforeUnmount, onMounted, toValue } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { administrationMessages } from '@/locales/administration'

async function defaultConfirm() {
  try {
    await ElMessageBox.confirm(
      administrationMessages.common.discardMessage,
      administrationMessages.common.discardTitle,
      {
        confirmButtonText: administrationMessages.common.discardConfirm,
        cancelButtonText: administrationMessages.common.stay,
        type: 'warning',
      },
    )
    return true
  } catch {
    return false
  }
}

export function createUnsavedChangesGuard(options = {}) {
  const confirm = options.confirm ?? defaultConfirm
  return {
    async canLeave({ dirty, submitted }) {
      if (!dirty || submitted) return true
      return Boolean(await confirm())
    },
  }
}

export function useUnsavedChangesGuard({ isDirty, submitted, confirm }) {
  const guard = createUnsavedChangesGuard({ confirm })
  const beforeUnload = (event) => {
    if (!toValue(isDirty) || toValue(submitted)) return
    event.preventDefault()
    event.returnValue = ''
  }

  onBeforeRouteLeave(() =>
    guard.canLeave({ dirty: toValue(isDirty), submitted: toValue(submitted) }),
  )
  onMounted(() => window.addEventListener('beforeunload', beforeUnload))
  onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))

  return guard
}
