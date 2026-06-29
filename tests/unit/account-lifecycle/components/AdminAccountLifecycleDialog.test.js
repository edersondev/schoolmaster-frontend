import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminAccountLifecycleDialog from '@/components/ui/admin/AdminAccountLifecycleDialog.vue'
import { lifecyclePlugins } from '../fixtures'

describe('AdminAccountLifecycleDialog', () => {
  it('requires lock reason and emits submit for unlock without reason', async () => {
    const lockWrapper = mount(AdminAccountLifecycleDialog, {
      props: { open: true, reason: '', action: 'lock' },
      global: {
        plugins: lifecyclePlugins(),
        stubs: {
          ElDialog: { template: '<section><slot /><slot name="footer" /></section>' },
        },
      },
    })
    await lockWrapper.findAll('button').at(-1).trigger('click')
    expect(lockWrapper.emitted('submit')).toBeUndefined()

    const unlockWrapper = mount(AdminAccountLifecycleDialog, {
      props: { open: true, reason: '', action: 'unlock' },
      global: {
        plugins: lifecyclePlugins(),
        stubs: {
          ElDialog: { template: '<section><slot /><slot name="footer" /></section>' },
        },
      },
    })
    await unlockWrapper.findAll('button').at(-1).trigger('click')
    expect(unlockWrapper.emitted('submit')).toBeTruthy()
  })
})
