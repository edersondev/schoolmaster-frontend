import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { computed, shallowRef } from 'vue'
import { useAccountLifecycleActions } from '@/composables/admin-system/useAccountLifecycleActions'
import { lifecyclePlugins, schoolId, userRecord } from '../fixtures'

describe('useAccountLifecycleActions permissions', () => {
  it('keeps actions blocked until approved source exists', () => {
    let lifecycle
    mount(
      {
        setup() {
          lifecycle = useAccountLifecycleActions({
            target: shallowRef(userRecord),
            schoolId: shallowRef(schoolId),
            permissions: computed(() => ['*']),
            service: {},
          })
          return {}
        },
        template: '<div />',
      },
      { global: { plugins: lifecyclePlugins() } },
    )

    expect(lifecycle.eligibility.value).toMatchObject({
      sourceConfirmed: false,
      blocked: true,
      canLock: false,
    })
  })
})

