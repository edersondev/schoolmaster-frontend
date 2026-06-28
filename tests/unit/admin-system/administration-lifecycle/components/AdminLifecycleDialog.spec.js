import { afterEach, describe, expect, it } from 'vitest'
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
})
