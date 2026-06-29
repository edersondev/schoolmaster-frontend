import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { computed, shallowRef } from 'vue'
import { useAccountLifecycleActions } from '@/composables/admin-system/useAccountLifecycleActions'
import { lifecyclePlugins, schoolId, userRecord } from '../fixtures'

describe('useAccountLifecycleActions outcomes', () => {
  it('does not call service while permission source is blocked', async () => {
    const service = { getAccountLock: vi.fn(), lockAccount: vi.fn() }
    let lifecycle
    mount(
      {
        setup() {
          lifecycle = useAccountLifecycleActions({
            target: shallowRef(userRecord),
            schoolId: shallowRef(schoolId),
            permissions: computed(() => ['*']),
            service,
          })
          return {}
        },
        template: '<div />',
      },
      { global: { plugins: lifecyclePlugins() } },
    )

    await lifecycle.loadLock()
    lifecycle.launch('lock')
    await lifecycle.submit()
    expect(service.getAccountLock).not.toHaveBeenCalled()
    expect(service.lockAccount).not.toHaveBeenCalled()
  })
})

