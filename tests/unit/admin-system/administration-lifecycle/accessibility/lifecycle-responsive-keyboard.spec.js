import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminBulkActionBar from '@/components/ui/admin/AdminBulkActionBar.vue'
import AdminLifecycleDialog from '@/components/ui/admin/AdminLifecycleDialog.vue'
import AdminRowActions from '@/components/ui/admin/AdminRowActions.vue'
import AdminStatusTag from '@/components/ui/admin/AdminStatusTag.vue'
import { administrationPlugins } from '../../administration/administration.fixtures'

describe('lifecycle responsive and keyboard coverage', () => {
  it.each([390, 768, 1440])('renders stable lifecycle controls at %ipx', async (width) => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })

    const tag = mount(AdminStatusTag, {
      props: { status: 'active' },
      global: { plugins: administrationPlugins() },
    })
    const actions = mount(AdminRowActions, {
      props: { actions: ['deactivate', 'delete'], canManage: true },
      global: { plugins: administrationPlugins() },
    })
    const bulk = mount(AdminBulkActionBar, {
      props: { selectedCount: 2, actions: ['deactivate'], overLimit: false },
      global: { plugins: administrationPlugins() },
    })

    await actions.find('button').trigger('keydown.enter')
    expect(tag.text()).toContain('Active')
    expect(actions.findAll('button').length).toBeGreaterThan(0)
    expect(bulk.text()).toContain('2 selected')
  })

  it('keeps confirmation fields keyboard reachable and validation visible', async () => {
    const wrapper = mount(AdminLifecycleDialog, {
      props: {
        open: true,
        action: 'deactivate',
        resourceType: 'users',
        resourceLabel: 'Ada Lovelace',
        currentStatus: 'active',
        values: { effectiveAt: '2026-06-28', reason: '' },
        fieldErrors: { reason: ['Reason is required.'] },
      },
      global: {
        plugins: administrationPlugins(),
        stubs: {
          ElDialog: {
            props: ['modelValue', 'title'],
            template:
              '<section v-if="modelValue"><h2>{{ title }}</h2><slot /><footer><slot name="footer" /></footer></section>',
          },
          ElDatePicker: { template: '<input />' },
          ElInput: { template: '<textarea />' },
        },
      },
    })

    expect(wrapper.text()).toContain('Reason is required.')
    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(wrapper.find('input').exists()).toBe(true)
  })
})
