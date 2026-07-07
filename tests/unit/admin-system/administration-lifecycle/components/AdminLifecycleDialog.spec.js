import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import AdminLifecycleDialog from '@/components/ui/admin/AdminLifecycleDialog.vue'
import { administrationPlugins } from '../../administration/administration.fixtures'

describe('AdminLifecycleDialog', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders required audited fields and soft-delete wording', async () => {
    mount(AdminLifecycleDialog, {
      attachTo: document.body,
      props: {
        open: true,
        values: { effectiveAt: '2026-06-28', reason: '' },
        action: 'delete',
        resourceLabel: 'Avery Admin',
        currentStatus: 'active',
        fieldErrors: { reason: ['Reason is required.'] },
      },
      global: { plugins: administrationPlugins() },
    })
    await nextTick()
    expect(document.body.textContent).toContain('recoverable soft deletion')
    expect(document.body.textContent).toContain('Reason is required.')
  })

  it('does not resolve an action translation when no lifecycle action is selected', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mount(AdminLifecycleDialog, {
      attachTo: document.body,
      props: {
        open: false,
        action: null,
        resourceLabel: '',
      },
      global: { plugins: administrationPlugins() },
    })
    await nextTick()

    expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('administrationLifecycle.actions.null'))
    warn.mockRestore()
  })
})
